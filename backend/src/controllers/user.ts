/**
 * Functions that process task route requests.
 */

import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import UserModel from "src/models/user";
import validationErrorParser from "src/util/validationErrorParser";

import type { RequestHandler } from "express";

/**
 * This is an example of an Express API request handler. We'll tell Express to
 * run this function when our backend receives a request to retrieve a
 * particular task.
 *
 * Request handlers typically have 3 parameters: req, res, and next.
 *
 * @param req The Request object from Express. This contains all the data from
 * the API request. (https://expressjs.com/en/4x/api.html#req)
 * @param res The Response object from Express. We use this to generate the API
 * response for Express to send back. (https://expressjs.com/en/4x/api.html#res)
 * @param next The next function in the chain of middleware. If there's no more
 * processing we can do in this handler, but we're not completely done handling
 * the request, then we can pass it along by calling next(). For all of the
 * handlers defined in `src/controllers`, the next function is the global error
 * handler in `src/app.ts`.
 */
export const getUser: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    // if the ID doesn't exist, then findById returns null
    const user = await UserModel.findById(id);

    if (user === null) {
      throw createHttpError(404, "User not found.");
    }

    // Set the status code (200) and body (the task object as JSON) of the response.
    // Note that you don't need to return anything, but you can still use a return
    // statement to exit the function early.
    res.status(200).json(user);
  } catch (error) {
    // pass errors to the error handler
    next(error);
  }
};

// Define a custom type for the request body so we can have static typing
// for the fields
type CreateUserBody = {
  name: string;
  profilePictureURL?: string;
};

type UpdateUserBody = {
  name: string;
  profilePictureURL?: string;
};

export const createUser: RequestHandler = async (req, res, next) => {
  // extract any errors that were found by the validator
  const errors = validationResult(req);
  const { name, profilePictureURL } = req.body as CreateUserBody;

  try {
    // if there are errors, then this function throws an exception
    validationErrorParser(errors);

    const user = await UserModel.create({
      name,
      profilePictureURL,
    });

    // 201 means a new resource has been created successfully
    // the newly created task is sent back to the user
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const removeUser: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await UserModel.deleteOne({ _id: id });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUser: RequestHandler = async (req, res, next) => {
  // extract any errors that were found by the validator
  const errors = validationResult(req);

  //CHANGE THIS LINE EVENTUALLY
  const { name, _id } = req.body as UpdateUserBody & { _id: string };
  const { id } = req.params;

  try {
    // if there are errors, then this function throws an exception
    validationErrorParser(errors);

    if (_id && id !== _id) {
      throw createHttpError(404, "User ID Mismatch.");
    }

    const task = await UserModel.findByIdAndUpdate(id, { name });

    if (task === null) {
      throw createHttpError(404, "Task not found.");
    }

    const updatedUser = await UserModel.findById(id);

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
