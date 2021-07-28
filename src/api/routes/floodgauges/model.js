/**
* CogniCity Server /floodgauges data model
* @module src/api/floodgauges/model
**/
import Promise from 'bluebird';

/**
* Methods to get floodgauges layers from database
* @alias module:src/api/floodgauges/model
* @param {Object} config Server configuration
* @param {Object} db PG Promise database instance
* @param {Object} logger Configured Winston logger instance
* @return {Object} Query methods
*/
export default (config, db, logger) => ({
  // Return all flood gauge reports within the defined max period
  // Optional: admin (Petabencana.id Instance Region 3 letter code)
  all: (admin) => new Promise((resolve, reject) => {
    let query = `SELECT gaugeid, gaugenameid, the_geom,
      array_to_json(array_agg((measuredatetime, depth, warninglevel,
          warningnameid) ORDER BY measuredatetime ASC)) as observations
      FROM ${config.TABLE_FLOODGAUGE_REPORTS}
      WHERE measuredatetime >= to_timestamp($1)
      AND ($2 IS NULL OR tags->>'instance_region_code'=$2)
      GROUP BY gaugeid, the_geom, gaugenameid LIMIT $3`;

    // Setup values
    let timeWindow = (Date.now() / 1000) -
      config.API_FLOODGAUGE_REPORTS_TIME_WINDOW;
    let values = [timeWindow, admin, config.API_FLOODGAUGE_REPORTS_LIMIT];

    // Execute
    logger.debug(query, values);
    db.any(query, values).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => reject(err));
  }),

  // Return specific flood gauge report by id
  byId: (id) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT pkey, gaugeid, gaugenameid, the_geom,
      array_to_json(array_agg((measuredatetime, depth, warninglevel,
          warningnameid) ORDER BY measuredatetime ASC)) as observations
      FROM ${config.TABLE_FLOODGAUGE_REPORTS}
      WHERE pkey = $1
      GROUP BY pkey, gaugeid, the_geom, gaugenameid`;

    // Setup values
    let values = [id];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      /* istanbul ignore next */
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

});
