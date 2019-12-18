// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportUser from '../../../app/service/User';
import ExportJwt from '../../../app/service/jwt';
import ExportMail from '../../../app/service/mail';
import ExportSms from '../../../app/service/sms';
import ExportVerification from '../../../app/service/verification';

declare module 'egg' {
  interface IService {
    user: ExportUser;
    jwt: ExportJwt;
    mail: ExportMail;
    sms: ExportSms;
    verification: ExportVerification;
  }
}
