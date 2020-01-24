// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportUser from '../../../app/service/User';
import ExportBlacklist from '../../../app/service/blacklist';
import ExportIr from '../../../app/service/ir';
import ExportJwt from '../../../app/service/jwt';
import ExportMail from '../../../app/service/mail';
import ExportSms from '../../../app/service/sms';
import ExportUserGroup from '../../../app/service/userGroup';
import ExportVerification from '../../../app/service/verification';

declare module 'egg' {
  interface IService {
    user: ExportUser;
    blacklist: ExportBlacklist;
    ir: ExportIr;
    jwt: ExportJwt;
    mail: ExportMail;
    sms: ExportSms;
    userGroup: ExportUserGroup;
    verification: ExportVerification;
  }
}
