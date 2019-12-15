// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportJwt from '../../../app/service/jwt';
import ExportMail from '../../../app/service/mail';
import ExportSms from '../../../app/service/sms';
import ExportUser from '../../../app/service/user';
import ExportVerification from '../../../app/service/verification';

declare module 'egg' {
  interface IService {
    jwt: ExportJwt;
    mail: ExportMail;
    sms: ExportSms;
    user: ExportUser;
    verification: ExportVerification;
  }
}
