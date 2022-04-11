/**
 * CogniCity Server configuration
 * @file config
 * @return {Object} Server configuration
*/
/* eslint-disable max-len */
require('dotenv').config({silent: true});

export default {
  APP_NAME: process.env.APP_NAME || 'cognicity-server',
  API_FEEDS_QLUE_CITIES: (process.env.API_FEEDS_QLUE_CITIES || 'jabodetabek,bandung,surabaya').split(','),
  API_FEEDS_QLUE_DISASTER_TYPES: (process.env.API_FEEDS_QLUE_DISASTER_TYPES || 'flood').split(','),
  API_FEEDS_DETIK_DISASTER_TYPES: (process.env.API_FEEDS_DEIK_DISASTER_TYPES || 'flood').split(','),
  FLOOD_REPORTS_TIME_WINDOW: process.env.FLOOD_REPORTS_TIME_WINDOW || 10800, // 3 hr
  EQ_REPORTS_TIME_WINDOW: process.env.EQ_REPORTS_TIME_WINDOW || 43200, // 12 hr
  WIND_REPORTS_TIME_WINDOW: process.env.WIND_REPORTS_TIME_WINDOW || 7200, // 2 hr
  HAZE_REPORTS_TIME_WINDOW: process.env.HAZE_REPORTS_TIME_WINDOW || 21600, // 6 hr
  VOLCANO_REPORTS_TIME_WINDOW: process.env.VOLCANO_REPORTS_TIME_WINDOW || 43200, // 12 hr
  FIRE_REPORTS_TIME_WINDOW: process.env.FIRE_REPORTS_TIME_WINDOW || 21600, // 6 hr
  API_REPORTS_TIME_WINDOW: process.env.API_REPORTS_TIME_WINDOW || 3600,
  API_REPORTS_TIME_WINDOW_MAX: process.env.API_REPORTS_TIME_WINDOW_MAX || 18748800, // 1m
  API_REPORTS_LIMIT: process.env.API_REPORTS_LIMIT,
  API_FLOODGAUGE_REPORTS_TIME_WINDOW: process.env.API_FLOODGAUGE_REPORTS_TIME_WINDOW || 43200,
  API_FLOODGAUGE_REPORTS_LIMIT: process.env.API_FLOODGAUGE_REPORTS_LIMIT,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://data.petabencana.id',
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'auth0_client_id',
  AUTH0_ISSUER: process.env.AUTH0_ISSUER || 'https://petabencana.au.auth0.com',
  AUTH0_SECRET: process.env.AUTH0_SECRET || 'secret',
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',
  AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID || '',
  AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
  AWS_S3_SIGNATURE_VERSION: process.env.AWS_SIGNATURE_VERSION || 'v4',
  BODY_LIMIT: process.env.BODY_LIMIT || '100kb',
  CACHE: process.env.CACHE === 'true' || false,
  CACHE_DURATION_CARDS: process.env.CACHE_DURATION_CARDS || '1 minute',
  CACHE_DURATION_FLOODS: process.env.CACHE_DURATION_FLOODS || '1 hour',
  CACHE_DURATION_FLOODS_STATES: process.env.CACHE_DURATION_FLOODS_STATES || '1 hour',
  CACHE_DURATION_INFRASTRUCTURE: process.env.CACHE_DURATION_INFRASTRUCTURE || '1 hour',
  CAP_DEFAULT_EXPIRE_SECONDS: process.env.CAP_DEFAULT_EXPIRE_SECONDS || 21600,
  CAP_TIMEZONE: process.env.CAP_TIMEZONE || 'Asia/Jakarta',
  COMPRESS: process.env.COMPRESS === 'true' || false,
  CORS: process.env.CORS === 'true' || true,
  CORS_HEADERS: process.env.CORS_HEADERS || ['Link'],
  DAMAGE_COMPONENT: process.env.DAMAGE_COMPONENT || 'roof,walls,plinth,nonstructural'.split(','),
  DISASTER_TYPES: (process.env.DISASTER_TYPES || 'flood,earthquake,prep,assessment,fire,haze,volcano,wind').split(','),
  FORMAT_DEFAULT: process.env.FORMAT_DEFAULT || 'json',
  FORMATS: (process.env.FORMATS || 'json').split(','),
  GEO_FORMAT_DEFAULT: process.env.GEO_FORMAT_DEFAULT || 'topojson',
  GEO_FORMATS: (process.env.GEO_FORMATS || 'geojson,topojson').split(','),
  GEO_PRECISION: process.env.GEO_PRECISION || 10,
  IMAGES_BUCKET: process.env.IMAGES_BUCKET || 'petabencana-image-uploads',
  PARTNER_IMAGES_BUCKET: process.env.PARTNER_IMAGES_BUCKET || 'petabencana-partner-images',
  IMAGES_HOST: process.env.IMAGES_HOST || 'images.petabencana.id',
  IMAGE_MIME_TYPES: (process.env.IMAGE_MIME_TYPES || 'image/png,image/jpeg,image/gif').split(','),
  INFRASTRUCTURE_TYPES: (process.env.INFRASTRUCTURE_TYPES || 'basins,floodgates,pumps,sites,waterways').split(','),
  LANGUAGES: (process.env.LANGUAGES || 'en,id').split(','),
  LOG_CONSOLE: process.env.LOG_CONSOLE === 'true' || false,
  LOG_DIR: process.env.LOG_DIR || '',
  LOG_JSON: process.env.LOG_JSON === 'true' || false,
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
  LOG_MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || 1024 * 1024 * 100,
  LOG_MAX_FILES: process.env.LOG_MAX_FILES || 10,
  NODE_ENV: process.env.NODE_ENV || 'development',
  NOTIFY_API_KEY: process.env.NOTIFY_API_KEY || '',
  NOTIFY_ENDPOINT: process.env.NOTIFY_ENDPOINT || 'api.petabencana.id/notify',
  PGHOST: process.env.PGHOST || '127.0.0.1',
  PGDATABASE: process.env.PGDATABASE || 'cognicity',
  PGPASSWORD: process.env.PGPASSWORD || 'p@ssw0rd',
  PGPORT: process.env.PGPORT || 5432,
  PGSSL: process.env.PGSSL === 'true' || false,
  PGTIMEOUT: process.env.PGTIMEOUT || 10000,
  PGUSER: process.env.PGUSER || 'postgres',
  PORT: process.env.PORT || 8001,
  REGION_CODES: (process.env.REGION_CODES || 'ID-BA,ID-NB,ID-BT,ID-JT,ID-JB,ID-KT,ID-KS,ID-KB,ID-ST,ID-GO,ID-SA,ID-SN,ID-SG,ID-SR,ID-AC,ID-BE,ID-JA,ID-LA,ID-RI,ID-SB,ID-SS,ID-SU,ID-NT,ID-MA,ID-MU,ID-JI,ID-BB,ID-KR,ID-PA,ID-PB,ID-KI,ID-KU,ID-YO,ID-JK,PH-QC,PH-PG,PH-01,PH-02,PH-03,PH-04,PH-05,PH-06,PH-07,PH-08,PH-09,PH-10,PH-11,PH-12,PH-13,PH-14,PH-15,PH-16,PH-40,PH-41,PH-00').split(','),
  REPORT_TYPES: (process.env.REPORT_TYPES || 'drain,damage,power,treeclearing,flood,assessment,earthquake,road,structure,fire,wind,volcano,haze').split(','),
  RESPONSE_TIME: process.env.RESPONSE_TIME === 'true' || false,
  SECURE_AUTH0: process.env.SECURE_AUTH0 === 'true' || false,
  TABLE_FLOODGAUGE_REPORTS: process.env.TABLE_FLOODGAUGE_REPORTS || 'floodgauge.reports',
  TABLE_FEEDS_QLUE: process.env.TABLE_FEEDS_QLUE || 'qlue.reports',
  TABLE_FEEDS_DETIK: process.env.TABLE_FEEDS_DETIK || 'detik.reports',
  TABLE_GRASP_CARDS: process.env.TABLE_GRASP_CARDS || 'grasp.cards',
  TABLE_GRASP_LOG: process.env.TABLE_GRASP_LOG || 'grasp.log',
  TABLE_GRASP_REPORTS: process.env.TABLE_GRASP_REPORTS || 'grasp.reports',
  TABLE_INSTANCE_REGIONS: process.env.TABLE_INSTANCE_REGIONS || 'cognicity.instance_regions',
  TABLE_LOCAL_AREAS: process.env.TABLE_LOCAL_AREAS || 'cognicity.local_areas',
  TABLE_LOCAL_AREAS_RW: process.env.TABLE_LOCAL_AREAS || 'cognicity.local_areas_RW',
  TABLE_REM_STATUS: process.env.TABLE_REM_STATUS || 'cognicity.rem_status',
  TABLE_REM_STATUS_LOG: process.env.TABLE_REM_STATUS_LOG || 'cognicity.rem_status_log',
  TABLE_REPORTS: process.env.TABLE_REPORTS || 'cognicity.all_reports',
  TABLE_REPORTS_POINTS_LOG: process.env.TABLE_REPORTS_LOG || 'cognicity.reports_points_log',
  TABLE_COGNICITY_PARTNERS: process.env.TABLE_COGNICITY_PARTNERS || 'cognicity.partners',

};
