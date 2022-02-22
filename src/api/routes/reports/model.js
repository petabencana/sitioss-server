/**
 * CogniCity Server /reports data model
 * @module src/api/reports/model
 **/
 import Promise from 'bluebird';

/**
 * Methods to get current flood reports from database
 * @alias module:src/api/reports/model
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} Query methods
 */
export default (config, db, logger) => ({
  all: (timeperiod, admin, disasterType) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT pkey, created_at, source,
      status, url, image_url, disaster_type, report_data, tags, title, text,
      the_geom, partner_code FROM ${config.TABLE_REPORTS}
      WHERE ((disaster_type = 'flood' AND created_at >= to_timestamp($1)) 
      OR (disaster_type = 'earthquake' AND created_at >= to_timestamp($2))
      OR (disaster_type = 'wind' AND created_at >= to_timestamp($3))
      OR (disaster_type = 'haze' AND created_at >= to_timestamp($4))
      OR (disaster_type = 'volcano' AND created_at >= to_timestamp($5))
      OR (disaster_type = 'fire' AND created_at >= to_timestamp($6)) )
      AND ($7 IS NULL OR tags->>'instance_region_code'=$7)
      AND ($9 is NULL OR disaster_type=$9)
      ORDER BY created_at DESC LIMIT $8`;

    let floodTimeWindow = (Date.now() / 1000) - (timeperiod ? timeperiod : config.FLOOD_REPORTS_TIME_WINDOW);
    let eqTimeWindow = (Date.now() / 1000) - (timeperiod ? timeperiod : config.EQ_REPORTS_TIME_WINDOW);
    let hazeTimeWindow = (Date.now() / 1000) - (timeperiod ? timeperiod : config.HAZE_REPORTS_TIME_WINDOW);
    let windTimeWindow = (Date.now() / 1000) - (timeperiod ? timeperiod : config.WIND_REPORTS_TIME_WINDOW);
    let volcanoTimeWindow = (Date.now() / 1000) - (timeperiod ? timeperiod : config.VOLCANO_REPORTS_TIME_WINDOW);
    let fireTimeWindow = (Date.now() / 1000) - (timeperiod ? timeperiod : config.FIRE_REPORTS_TIME_WINDOW);

    let values = [floodTimeWindow, eqTimeWindow, windTimeWindow, hazeTimeWindow, volcanoTimeWindow, fireTimeWindow, admin, config.API_REPORTS_LIMIT, disasterType];

    // Execute
    logger.debug(query, values);
    db.any(query, values).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

  // Return specific report by id
  byId: (id) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT pkey, created_at, source,
      status, url, image_url, disaster_type, report_data, tags, title, text,
      the_geom FROM ${config.TABLE_REPORTS}
      WHERE pkey = $1`;

    // Setup values
    let values = [id];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

  // Update a report's points value
  addPoint: (id, body) => new Promise((resolve, reject) => {
    // Setup query
    let query = `UPDATE ${config.TABLE_REPORTS} SET report_data =
    (SELECT COALESCE(report_data::jsonb, '{}') || ('{"points":' ||
      (COALESCE((report_data->>'points')::int, 0) + $2) || '}')::jsonb points
      FROM ${config.TABLE_REPORTS} WHERE pkey = $1) WHERE pkey = $1
      RETURNING report_data->>'points' as points`;

    let values = [id, body.points];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      .then((data) => {
        // Report points changes, update database log
        let query = `INSERT INTO ${config.TABLE_REPORTS_POINTS_LOG}
                      (report_id, value) VALUES ($1, $2)`;
        let values = [id, body.points];
        // Execute
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
          .then(() => {
            resolve(data);
          })
          /* istanbul ignore next */
          .catch((err) => {
            /* istanbul ignore next */
            reject(err);
          });
        })
        /* istanbul ignore next */
        .catch((err) => {
          /* istanbul ignore next */
          reject(err);
        });
    }),

    // Update a report's flag value
    setFlag: (id, body) => new Promise((resolve, reject) => {
      // Setup query
      let query = `UPDATE ${config.TABLE_REPORTS} SET report_data = 
      (SELECT COALESCE(report_data::jsonb, '{}') || 
        ('{"flag":' || $2 || '}')::jsonb flag
      FROM ${config.TABLE_REPORTS} WHERE pkey = $1) WHERE pkey = $1
      RETURNING report_data->>'flag' as flag`;

      let values = [id, body.flag];

      // Execute
      logger.debug(query, values);
      db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
        .then((data) => {
          resolve(data);
        })
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
    }),
});
