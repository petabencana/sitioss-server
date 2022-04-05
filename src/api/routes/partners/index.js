/**
 * CogniCity Server /partners endpoint
 * @module src/api/partners/index
 **/
import { Router } from "express";

// Import our data model
import partners from "./model";

// Import any required utility functions
import { cacheResponse, handleGeoResponse } from "../../../lib/util";

// Import validation dependencies
import Joi from "joi";
import validate from "celebrate";
// Import image upload capabilities
import AWS from "aws-sdk";
import { id } from "apicache";

const multer = require("multer");
const multerS3 = require("multer-s3");

/**
 * Endpoint specification for floodgauges data
 * @alias module:src/api/partners/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for reports route
 */
export default ({ config, db, logger }) => {
  let api = Router(); // eslint-disable-line new-cap

  // Create an S3 object
  let s3 = new AWS.S3({
    accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
    signatureVersion: config.AWS_S3_SIGNATURE_VERSION,
    region: config.AWS_REGION,
  });

  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: config.PARTNER_IMAGES_BUCKET,
      key: function (req, file, cb) {
        cb(null, req.body.partner_code + "_" + file.originalname);
      },
      contentType: function (req, file, cb) {
        cb(null, file.mimetype);
      },
      contentEncoding: function (req, file, cb) {
        cb(null, file.encoding);
      },
    }),
  });

  const s3util = (s3params, isValid) => {
    return new Promise((resolve, reject) => {
      s3.getSignedUrl("getObject", s3params, (err, data) => {
        let returnData;
        if (err) {
          /* istanbul ignore next */
          reject(err);
        } else {
          returnData = {
            signedRequest: data,
            url:
              "https://s3." +
              config.AWS_REGION +
              ".amazonaws.com/" +
              config.PARTNER_IMAGES_BUCKET +
              "/" +
              s3params.Key,
          };
          // Return signed URL
          logger.debug("s3 signed request: " + returnData.signedRequest);
          resolve(returnData.signedRequest);
          if (!isValid) {
            reject("File not uploaded");
            s3.deleteObject(s3params, function (err, data) {
              if (err) {
                reject(err);
              }
            });
          }
        }
      });
    });
  };

  // Create a new partner
  api.post(
    "/create-partner",
    upload.single("partner_icon"),
    (req, res, next) => {
      const { body } = req;
      const blogSchema = Joi.object().keys({
        partner_code: Joi.string().required(),
        partner_name: Joi.string().required(),
      });
      const result = Joi.validate(body, blogSchema);
      const { value, error } = result;
      const valid = error == null;
      if (!valid) {
        res.status(422).json({
          message: "Invalid request",
          data: body,
        });
      }
      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "Please upload a file." });
      }

      //Forming a filename to post to s3
      const key = req.body.partner_code + "_" + file.originalname;

      let s3params = {
        Bucket: config.PARTNER_IMAGES_BUCKET,
        Key: key,
      };
      // Call AWS S3 library
      s3util(s3params, valid)
        .then((response) => {
          body.partner_icon = response;
          partners(config, db, logger)
            .addNewPartner(body)
            .then((data) => res.json(data))
            .catch((err) => {
              /* istanbul ignore next */
              logger.error(err);
              /* istanbul ignore next */
              next(err);
            });
        })
        .catch((err) => {
          logger.error("could not get signed url from S3");
          /* istanbul ignore next */
          logger.error(err);
          returnData = { statusCode: 500, error: err };
        });
    }
  );

  // Get details of a partner
  api.get("/", (req, res, next) =>
    partners(config, db, logger)
      .all()
      .then((data) => res.json(data))
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
        next(err);
      })
  );

  //Fetch with  partner code
  api.get(
    "/partner",
    validate({
      query: { partner_name: Joi.string().min(3).max(36) },
      query: { partner_code: Joi.string().min(3).max(36) },
    }),
    (req, res, next) =>
      partners(config, db, logger)
        .getByCode(req.query)
        .then((data) => res.json(data))
        .catch((err) => {
          /* istanbul ignore next */
          logger.error(err);
          /* istanbul ignore next */
          next(err);
        })
  );

  api.patch("/partner/:id", (req, res, next) => {
    const file = req.file;
    partners(config, db, logger)
      .updateRecord(req.body, req.params)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
        next(err);
      });
  });

  const getAndDeleteObject = (requestBody, params) => {
    partners(config, db, logger)
      .getById(params)
      .then((data) => {
        let splitingUrl = data[0]["partner_icon"].split("?");

        let splitingFile = splitingUrl[0].split("/");

        let s3params = {
          Bucket: config.PARTNER_IMAGES_BUCKET,
          Key: splitingFile[splitingFile.length - 1],
        };
        s3.deleteObject(s3params, function (err, data) {
          if (err) {
            /* istanbul ignore next */
            logger.error("could not get signed url from S3");
            /* istanbul ignore next */
            logger.error(err);
          }
        });
      })
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
      });
  };

  api.put("/partner/:id", upload.single("partner_icon"), (req, res, next) => {
    const { body } = req;
    const blogSchema = Joi.object().keys({
      partner_code: Joi.string().required(),
      partner_name: Joi.string().required(),
    });
    const result = Joi.validate(body, blogSchema);
    const { value, error } = result;
    const valid = error == null;
    if (!valid) {
      res.status(422).json({
        message: "Invalid request",
        data: body,
      });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).send({ message: "Please upload a file." });
    }

    //Forming a filename to post to s3
    const key = req.body.partner_code + "_" + file.originalname;

    // Deleting existing s3 Object

    getAndDeleteObject(body, req.params);
    let s3params = {
      Bucket: config.PARTNER_IMAGES_BUCKET,
      Key: key,
    };

    // Call AWS S3 library
    s3util(s3params, valid)
      .then((response) => {
        body.partner_icon = response;
        partners(config, db, logger)
          .updateRecord(body, req.params)
          .then((data) => res.json(data))
          .catch((err) => {
            /* istanbul ignore next */
            logger.error(err);
            /* istanbul ignore next */
            next(err);
          });
      })
      .catch((err) => {
        logger.error("could not get signed url from S3");
        /* istanbul ignore next */
        logger.error(err);
        returnData = { statusCode: 500, error: err };
      });
  });

  return api;
};
