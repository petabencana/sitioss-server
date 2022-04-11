/**
 * CogniCity Server /feeds data model
 * @module src/api/partners/model
 **/
import Promise from "bluebird";

/**
 * Methods to interact with feeds layers in database
 * @alias module:src/api/partners/model
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} Query methods
 */
export default (config, db, logger) => ({
  // Add a new partner
  addNewPartner: (body) =>
    new Promise((resolve, reject) => {
      // Setup query
      let query = `INSERT INTO ${config.TABLE_COGNICITY_PARTNERS}
       (partner_code, partner_name, partner_icon)
      VALUES ($1, $2, $3)`;

      // Setup values
      let values = [body.partner_code, body.partner_name, body.partner_icon];

      // Execute
      logger.debug(query, values);
      db.oneOrNone(query, values)
        .timeout(config.PGTIMEOUT)
        .then(() => resolve({ partner_code: body.partner_code, created: true }))
        .catch((err) => {
          reject(err);
        });
    }),

  all: (value) =>
    new Promise((resolve, reject) => {
      let query = `SELECT *
      FROM ${config.TABLE_COGNICITY_PARTNERS}
      `;
      // Setup values
      //   let values = [value];

      // Execute
      logger.debug(query);
      db.any(query)
        .timeout(config.PGTIMEOUT)
        .then((data) => resolve(data))
        /* istanbul ignore next */
        .catch((err) => {
          /* istanbul ignore next */
          reject(err);
        });
    }),

  getById: (value) =>
    new Promise((resolve, reject) => {
      // Setup query
      let id = value.id;

      const query = `SELECT * FROM ${config.TABLE_COGNICITY_PARTNERS}
        WHERE id = $1`;
      const values = [id];

      // Execute
      logger.debug(query, values);
      db.any(query, values)
        .timeout(config.PGTIMEOUT)
        .then((data) => {
          resolve(data);
        })
        /* istanbul ignore next */
        .catch((err) => {
          /* istanbul ignore next */
          reject(err);
        });
    }),

  getByCode: (value) =>
    new Promise((resolve, reject) => {
      // Setup query
      let partner_code = value.partner_code;

      const query = `SELECT * FROM ${config.TABLE_COGNICITY_PARTNERS}
        WHERE partner_code = $1`;
      const values = [partner_code];

      // Execute
      logger.debug(query, values);
      db.any(query, values)
        .timeout(config.PGTIMEOUT)
        .then((data) => {
          resolve(data);
        })
        /* istanbul ignore next */
        .catch((err) => {
          /* istanbul ignore next */
          reject(err);
        });
    }),

  updateRecord: (data, param) =>
    new Promise((resolve, reject) => {
      // Setup query
      let partner_name = data.partner_name ? data.partner_name : null;
      let partner_code = data.partner_code ? data.partner_code : null;
      let partner_status =
        data.partner_status !== undefined ? data.partner_status : null;
      let partner_icon = data.partner_icon ? data.partner_icon : null;
      const query = `UPDATE ${config.TABLE_COGNICITY_PARTNERS}
        SET partner_name = COALESCE($1, partner_name)  , partner_code = COALESCE($2, partner_code) , partner_status = COALESCE($3, partner_status) , partner_icon = COALESCE($4, partner_icon) WHERE id = ${param.id}`;
      const values = [partner_name, partner_code, partner_status, partner_icon];
      // Execute
      logger.debug(query, values);
      db.any(query, values)
        .timeout(config.PGTIMEOUT)
        .then(() => {
          resolve({
            updated: true,
          });
        })
        /* istanbul ignore next */
        .catch((err) => {
          /* istanbul ignore next */
          reject(err);
        });
    }),
});
