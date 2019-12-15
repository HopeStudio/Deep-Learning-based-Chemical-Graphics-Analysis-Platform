// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportHome from '../../../app/controller/home';
import ExportUser from '../../../app/controller/user';
import ExportVerification from '../../../app/controller/verification';

declare module 'egg' {
  interface IController {
    home: ExportHome;
    user: ExportUser;
    verification: ExportVerification;
  }
}
