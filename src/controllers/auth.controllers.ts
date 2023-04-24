import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { body, matchedData } from 'express-validator';
import jwt from 'jsonwebtoken';
import validate from '../middleware/validate.middleware';
import APIResponse from '../types/APIResponse';
import UserLocals from '../types/UserLocals';
import ApplicationError from '../utils/ApplicationError';

const prisma = new PrismaClient();

export async function getUser(req: Request, res: APIResponse<UserLocals>) {
  const { password, ...user } = await prisma.user.findUniqueOrThrow({ where: { id: res.locals.user.id } });
  res.json({ status: 'success', data: user });
}

export async function getStudent(req: Request, res: APIResponse<UserLocals>) {
  const { username, password, student, ...user } = await prisma.user.findUniqueOrThrow({
    where: { id: res.locals.user.id },
    include: { student: true },
  });

  res.json({ status: 'success', data: { ...user, ...student } });
}

export async function loginAdmin(req: Request, res: APIResponse) {
  // Get login credentials from request body
  const { username, password } = matchedData(req, { locations: ['body'] });

  // Retrieve user from database if doesn't exist return null
  const userOrNull = await prisma.user.findUnique({ where: { username: username } });

  // Throw invalid credentials error if user doesn't exist or role & password doesn't match
  if (!userOrNull || userOrNull.role !== 'admin' || userOrNull.password !== password)
    throw new ApplicationError('Invalid username or password', 400);

  // Remove password from user & sign jwt with user as payload
  const { password: _, ...user } = userOrNull;
  const token = jwt.sign(user, process.env.JWT_SECRET!);

  res.json({ status: 'success', data: { user, token } });
}

export async function loginTeacher(req: Request, res: APIResponse) {
  // Get login credentials from request body
  const { username, password } = matchedData(req, { locations: ['body'] });

  // Retrieve user from database if doesn't exist return null
  const userOrNull = await prisma.user.findUnique({ where: { username: username } });

  // Throw invalid credentials error if user doesn't exist or role & password doesn't match
  if (!userOrNull || userOrNull.role !== 'teacher' || userOrNull.password !== password)
    throw new ApplicationError('Invalid username or password', 400);

  // Remove password from user & sign jwt with user as payload
  const { password: _, ...user } = userOrNull;
  const token = jwt.sign(user, process.env.JWT_SECRET!);

  res.json({ status: 'success', data: { user, token } });
}

export async function loginStudent(req: Request, res: APIResponse) {
  // Get login credentials from request body
  const { username, password } = matchedData(req, { locations: ['body'] });

  // Retrieve user from database if doesn't exist return null
  const userOrNull = await prisma.user.findUnique({ where: { username: username } });

  // Throw invalid credentials error if user doesn't exist or role & password doesn't match
  if (!userOrNull || userOrNull.role !== 'student' || userOrNull.password !== password)
    throw new ApplicationError('Invalid username or password', 400);

  // Remove password from user & sign jwt with user as payload
  const { password: _, ...user } = userOrNull;
  const token = jwt.sign(user, process.env.JWT_SECRET!);

  res.json({ status: 'success', data: { user, token } });
}

export async function registerStudent(req: Request, res: APIResponse) {
  // Get student details from request body
  const { name, email, username, password, ...studentDetails } = matchedData(req, { locations: ['body'] });

  // Create user whose role is `student`
  const { password: _, ...user } = await prisma.user.create({
    data: {
      name,
      email,
      username,
      password,
      role: 'student',
      student: { create: studentDetails as any },
    },
  });

  // Sign jwt with user as payload
  const token = jwt.sign(user, process.env.JWT_SECRET!);

  res.json({ status: 'success', data: { user, token } });
}

export const validateLoginCredentials = [
  body('username').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('password').exists({ checkNull: true, checkFalsy: true }).isString(),
  validate,
];

export const validateStudentRegisterCredentials = [
  body('name').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('email').exists({ checkNull: true, checkFalsy: true }).isEmail(),
  body('username').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('password').exists({ checkNull: true, checkFalsy: true }).isStrongPassword(),
  body('studentId').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('course').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('year').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('semester').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('branch').exists({ checkNull: true, checkFalsy: true }).isString(),
  body('rollNo').exists({ checkNull: true, checkFalsy: true }).isString(),
  validate,
];
