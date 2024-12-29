"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = require("../lib/prisma");
var clinics_json_1 = require("../test_data/clinics.json");
var patients_json_1 = require("../test_data/patients.json");
var practitioner_json_1 = require("../test_data/practitioner.json");
var practitioner_availability_json_1 = require("../test_data/practitioner_availability.json");
var users_json_1 = require("../test_data/users.json");
var bcrypt_1 = require("bcrypt");
var client_1 = require("@prisma/client");
// Utility to convert string time to Date
var parseTime = function (time) {
    return time ? new Date("1970-01-01T".concat(time, "Z")) : null;
};
// Enum validation
var validateEnum = function (value, enumObj) {
    if (Object.values(enumObj).includes(value)) {
        return value;
    }
    throw new Error("Invalid enum value: ".concat(value));
};
// Main function
function populateDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, clinic, _b, _c, patient, _d, _e, practitioner, _f, availabilityData_1, slot, _g, _h, user, hashedPassword, error_1;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 22, 23, 25]);
                    console.log("🚀 Populating Clinics...");
                    _i = 0, _a = clinics_json_1.default.clinics;
                    _j.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    clinic = _a[_i];
                    return [4 /*yield*/, prisma_1.default.clinics.create({
                            data: {
                                name: clinic.name,
                                address: clinic.address,
                                phone: clinic.phone,
                                url: clinic.url,
                                description: clinic.description,
                                clinic_context: clinic.clinic_context,
                                opening_time: parseTime(clinic.opening_time),
                                closing_time: parseTime(clinic.closing_time),
                                clinic_type: clinic.clinic_type.map(function (type) {
                                    return validateEnum(type, client_1.clinictype);
                                }),
                                days_opened: clinic.days_opened.map(function (day) {
                                    return validateEnum(day, client_1.dayofweek);
                                }),
                            },
                        })];
                case 2:
                    _j.sent();
                    _j.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("🚀 Populating Patients...");
                    _b = 0, _c = patients_json_1.default.patients;
                    _j.label = 5;
                case 5:
                    if (!(_b < _c.length)) return [3 /*break*/, 8];
                    patient = _c[_b];
                    return [4 /*yield*/, prisma_1.default.patients.create({
                            data: {
                                first_name: patient.first_name,
                                last_name: patient.last_name,
                                patient_type: validateEnum(patient.patient_type, client_1.patienttype),
                                medicare_number: patient.medicare_number,
                                medicare_expiry: patient.medicare_expiry
                                    ? new Date(patient.medicare_expiry)
                                    : null,
                                email: patient.email,
                                phone: patient.phone,
                                clinic_id: BigInt(patient.clinic_id),
                                patient_context: patient.patient_context,
                            },
                        })];
                case 6:
                    _j.sent();
                    _j.label = 7;
                case 7:
                    _b++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log("🚀 Populating Practitioners...");
                    _d = 0, _e = practitioner_json_1.default.practitioners;
                    _j.label = 9;
                case 9:
                    if (!(_d < _e.length)) return [3 /*break*/, 12];
                    practitioner = _e[_d];
                    return [4 /*yield*/, prisma_1.default.practitioners.create({
                            data: {
                                name: practitioner.name,
                                email: practitioner.email,
                                phone: practitioner.phone,
                                practitioner_type: validateEnum(practitioner.practitioner_type, client_1.practitionertype),
                                clinic_id: BigInt(practitioner.clinic_id),
                                bio: practitioner.bio,
                                practitioner_image_url: practitioner.practitioner_image_url,
                                specialization: practitioner.specialization.map(function (spec) {
                                    return validateEnum(spec, client_1.specialization);
                                }),
                            },
                        })];
                case 10:
                    _j.sent();
                    _j.label = 11;
                case 11:
                    _d++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log("🚀 Populating Practitioner Availability...");
                    _f = 0, availabilityData_1 = practitioner_availability_json_1.default;
                    _j.label = 13;
                case 13:
                    if (!(_f < availabilityData_1.length)) return [3 /*break*/, 16];
                    slot = availabilityData_1[_f];
                    return [4 /*yield*/, prisma_1.default.practitioner_availability.create({
                            data: {
                                practitioner_id: BigInt(slot.practitioner_id),
                                clinic_id: BigInt(slot.clinic_id),
                                day_of_week: slot.day_of_week
                                    ? validateEnum(slot.day_of_week, client_1.dayofweek)
                                    : null,
                                date: slot.date ? new Date(slot.date) : null,
                                start_time: parseTime(slot.start_time),
                                end_time: parseTime(slot.end_time),
                                is_available: slot.is_available,
                            },
                        })];
                case 14:
                    _j.sent();
                    _j.label = 15;
                case 15:
                    _f++;
                    return [3 /*break*/, 13];
                case 16:
                    console.log("🚀 Populating Users...");
                    _g = 0, _h = users_json_1.default.users;
                    _j.label = 17;
                case 17:
                    if (!(_g < _h.length)) return [3 /*break*/, 21];
                    user = _h[_g];
                    return [4 /*yield*/, bcrypt_1.default.hash(user.password, 10)];
                case 18:
                    hashedPassword = _j.sent();
                    return [4 /*yield*/, prisma_1.default.users.create({
                            data: {
                                email: user.email,
                                name: user.name,
                                phone: user.phone,
                                password: hashedPassword,
                                hasClinic: user.hasClinic,
                                clinic_id: user.clinic_id ? BigInt(user.clinic_id) : null,
                            },
                        })];
                case 19:
                    _j.sent();
                    _j.label = 20;
                case 20:
                    _g++;
                    return [3 /*break*/, 17];
                case 21:
                    console.log("✅ Database population complete!");
                    return [3 /*break*/, 25];
                case 22:
                    error_1 = _j.sent();
                    console.error("❌ Error populating database:", error_1);
                    return [3 /*break*/, 25];
                case 23: return [4 /*yield*/, prisma_1.default.$disconnect()];
                case 24:
                    _j.sent();
                    return [7 /*endfinally*/];
                case 25: return [2 /*return*/];
            }
        });
    });
}
populateDatabase();
