// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportFile from '../../../app/controller/file';
import ExportHome from '../../../app/controller/home';
import ExportIr from '../../../app/controller/ir';
import ExportUser from '../../../app/controller/user';
import ExportVerification from '../../../app/controller/verification';

declare module 'egg' {
  interface IController {
    file: ExportFile;
    home: ExportHome;
    ir: ExportIr;
    user: ExportUser;
    verification: ExportVerification;
  }
}
