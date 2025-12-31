import TaskModel from "src/models/task";

import type { RequestHandler } from "express";

export const getAllTasks: RequestHandler = async (req, res, next) => {
  try {
    const sortedTasks = await TaskModel.find().populate("assignee").sort({ dateCreated: "desc" });

    res.status(200).json(sortedTasks);
  } catch (error) {
    next(error);
  }
};
