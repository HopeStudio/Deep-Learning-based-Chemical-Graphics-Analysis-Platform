// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportMail from '../../../app/service/mail';
import ExportUser from '../../../app/service/user';
import ExportVerification from '../../../app/service/verification';

declare module 'egg' {
  interface IService {
    mail: ExportMail;
    user: ExportUser;
    verification: ExportVerification;
  }
}
