/**
 * CogniCity Server /floods endpoint
 * @module src/api/floods/index
 **/
import {Router} from 'express';

// Import our data model
import floods from './model';

// Import child routes
import archive from './archive';
import timeseries from './timeseries';

// Import any required utility functions
import {cacheResponse, formatGeo, jwtCheck} from '../../../lib/util';

// Caching
import apicache from 'apicache';
const CACHE_GROUP_FLOODS = '/floods';
const CACHE_GROUP_FLOODS_STATES = '/floods/states';

// Cap formatter helper
import Cap from '../../../lib/cap';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Rem status codes
const REM_STATES = {
  1: {
    severity: 'Unknown',
    levelDescription: 'AN UNKNOWN LEVEL OF FLOODING - USE CAUTION -',
  },
  2: {
    severity: 'Minor',
    levelDescription: 'FLOODING OF BETWEEN 10 and 70 CENTIMETERS',
  },
  3: {
    severity: 'Moderate',
    levelDescription: 'FLOODING OF BETWEEN 71 and 150 CENTIMETERS',
  },
  4: {
    severity: 'Severe',
    levelDescription: 'FLOODING OF OVER 150 CENTIMETERS',
  },
};

// Function to clear out the cache
const clearCache = () => {
  apicache.clear(CACHE_GROUP_FLOODS);
  apicache.clear(CACHE_GROUP_FLOODS_STATES);
};

/**
 * Endpoint specification for floods data
 * @alias module:src/api/floods/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for reports route
 */
export default ({config, db, logger}) => {
  let api = Router(); // eslint-disable-line new-cap
  const cap = new Cap(config, logger); // Setup our cap formatter

  // Get a list of all floods
  api.get('/', cacheResponse(config.CACHE_DURATION_FLOODS),
    validate({
      query: {
        admin: Joi.any().valid(config.REGION_CODES),
        parent: Joi.string().allow(null, ''),
        format: Joi.any().valid(['xml'].concat(config.FORMATS))
                .default(config.FORMAT_DEFAULT),
        geoformat: Joi.any().valid(['cap'].concat(config.GEO_FORMATS))
                .default(config.GEO_FORMAT_DEFAULT),
        minimum_state: Joi.number().integer().valid(Object.keys(REM_STATES)).allow(null, ''),
      },
    }),
    (req, res, next) => {
      req.apicacheGroup = CACHE_GROUP_FLOODS;
      if (req.query.geoformat === 'cap' && req.query.format !== 'xml') {
        res.status(400).json({statusCode: 400,
                    message: 'format must be \'xml\' when geoformat=\'cap\''});
      } else if (config.GEO_FORMATS.indexOf(req.query.geoformat) > -1
        && req.query.format !== 'json') {
          res.status(400).json({statusCode: 400,
            message: 'format must be \'json\' when geoformat '
                      +'IN (\'geojson\',\'topojson\')'});
      } else {
        floods(config, db, logger).allGeo(req.query.admin,
        req.query.minimum_state || null, req.query.parent || null)
        .then((data) =>
          req.query.geoformat === 'cap' ?
            // If CAP format has been required convert to geojson then to CAP
            formatGeo(data, 'geojson')
              .then((formatted) => res.status(200)
                .set('Content-Type', 'text/xml')
                .send(cap.geoJsonToAtomCap(formatted.features)))
              /* istanbul ignore next */
              .catch((err) => next(err)) :
            // Otherwise hand off to geo formatter
            formatGeo(data, req.query.geoformat)
              .then((formatted) => res.status(200)
                .json({statusCode: 200, result: formatted}))
              /* istanbul ignore next */
              .catch((err) => next(err))
        )
        .catch((err) => {
          /* istanbul ignore next */
          logger.error(err);
          /* istanbul ignore next */
          next(err);
        });
      }
    }
  );

  // Just get the states without the geographic boundaries
  api.get('/states', cacheResponse(config.CACHE_DURATION_FLOODS_STATES),
    validate({
      query: {
        admin: Joi.any().valid(config.REGION_CODES),
        format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
        minimum_state: Joi.number().integer().valid(Object.keys(REM_STATES)),
      },
    }),
    (req, res, next) => {
      req.apicacheGroup = CACHE_GROUP_FLOODS_STATES;
      floods(config, db, logger).all(req.query.admin, req.query.minimum_state)
        .then((data) => res.status(200).json({statusCode: 200, result: data}))
        .catch((err) => {
          /* istanbul ignore next */
          logger.error(err);
          /* istanbul ignore next */
          next(err);
        });
    }
  );

  // Just get Districts, SubDistricts and Villages without geographic boundaries

  api.get('/places', cacheResponse(config.CACHE_DURATION_FLOODS_STATES),
    validate({
      query: {
        admin: Joi.any().valid(config.REGION_CODES)
      },
    }),
    (req, res, next) => {
      req.apicacheGroup = CACHE_GROUP_FLOODS_STATES;
      floods(config, db, logger).allPlaces(req.query.admin, req.query.minimum_state)
        .then((data) => res.status(200).json({statusCode: 200, result: data}))
        .catch((err) => {
          /* istanbul ignore next */
          logger.error(err);
          /* istanbul ignore next */
          next(err);
        });
    }
  );

  // Update the flood status of a local area
  api.put('/:localAreaId', jwtCheck,
    validate({
      params: {localAreaId: Joi.number().integer().required()},
      body: Joi.object().keys({
        state: Joi.number().integer()
          .valid(Object.keys(REM_STATES).map((state) => parseInt(state)))
          .required(),
      }),
      query: {
        username: Joi.string().required(),
      },
    }),
    (req, res, next) => floods(config, db, logger)
    .updateREMState(req.params.localAreaId, req.body.state, req.query.username)
      .then(() => {
        clearCache();
        res.status(200).json({localAreaId: req.params.localAreaId,
          state: req.body.state, updated: true});
      })
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
        next(err);
      })
  );

  // Remove the flood status of a local and add a log entry for audit
  api.delete('/:localAreaId', jwtCheck,
    validate({
      params: {localAreaId: Joi.number().integer().required()},
      query: {
        username: Joi.string().required(),
      },
    }),
    (req, res, next) => floods(config, db, logger)
      .clearREMState(req.params.localAreaId, req.query.username)
      .then(() => {
        clearCache();
        res.status(200).json({localAreaId: req.params.localAreaId,
          state: null, updated: true});
      })
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
        next(err);
      })
  );

  // to get max flood states between two dates
  api.use('/archive', archive({config, db, logger}));
  api.use('/timeseries', timeseries({config, db, logger}));

  return api;
};
