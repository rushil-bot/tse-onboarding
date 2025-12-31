import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import TaskModel from "src/models/task";
import validationErrorParser from "src/util/validationErrorParser";

import type { RequestHandler } from "express";

export const getTask: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await TaskModel.findById(id).populate("assignee");

    if (task === null) {
      throw createHttpError(404, "Task not found.");
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

type CreateTaskBody = {
  title: string;
  description?: string;
  isChecked?: boolean;
  assignee?: string; // Added assignee
};

type UpdateTaskBody = {
  title: string;
  description?: string;
  isChecked?: boolean;
  assignee?: string; // Added assignee
};

export const createTask: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  // Extract assignee along with other fields
  const { title, description, isChecked, assignee } = req.body as CreateTaskBody;

  try {
    validationErrorParser(errors);

    const task = await TaskModel.create({
      title,
      description,
      isChecked,
      assignee, // Save the assignee
      dateCreated: Date.now(),
    });

    // Populate the assignee so the frontend gets the user object back immediately
    await task.populate("assignee");

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const removeTask: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await TaskModel.deleteOne({ _id: id });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateTask: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  // Extract ALL fields: title, description, assignee, isChecked
  const { title, description, assignee, isChecked, _id } = req.body as UpdateTaskBody & {
    _id: string;
  };
  const { id } = req.params;

  try {
    validationErrorParser(errors);

    if (_id && id !== _id) {
      throw createHttpError(404, "Task ID Mismatch.");
    }

    // Update all fields in the database
    const task = await TaskModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        assignee,
        isChecked,
      },
      { new: true }, // Optional: returns the modified document
    );

    if (task === null) {
      throw createHttpError(404, "Task not found.");
    }

    const updatedTask = await TaskModel.findById(id).populate("assignee");

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};
