const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const utils = {
  message: "Internal server error",

  stringSlug(string, sign = "-") {
    return string
      .toLowerCase()
      .replace(/[\s_&]+/g, sign)
      .replace(/-+/g, sign)
      .replace(/[^\w\-]/g, "")
      .replace(/^-|-$/g, "");
  },

  randomKey(length = 5, stringOnly = false) {
    if (stringOnly) {
      const characters = "abcdefghijklmnopqrstuvwxyz";
      return [...Array(length)]
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join("");
    } else {
      return [...Array(length)]
        .map(() => Math.random().toString(36)[2])
        .join("");
    }
  },

  paginate(page, perPage) {
    page = Math.max(Number(page) || 1, 1);
    const limit = Math.max(Number(perPage) || 1, 1);
    const skip = (page - 1) * limit;

    return [{ $skip: skip }, { $limit: limit }];
  },

  hasOne(query, from, as, select = []) {
    const $expr = { $eq: ["$_id", `$$${query}`] };
    const pipeline = [{ $match: { $expr } }];
    if (select.length) {
      pipeline.push({
        $project: Object.fromEntries(select.map((key) => [key, 1])),
      });
    }
    return [
      {
        $lookup: {
          from,
          let: { [query]: `$${query}` },
          pipeline,
          as,
        },
      },
      {
        $addFields: {
          [as]: { $arrayElemAt: [`$${as}`, 0] },
        },
      },
    ];
  },

  hasMany(
    from,
    localField,
    foreignField,
    as,
    select = [],
    additionalCriteria = {}
  ) {
    const pipeline = [];
    if (Object.keys(additionalCriteria).length) {
      pipeline.push({
        $match: additionalCriteria,
      });
    }
    if (select.length) {
      pipeline.push({
        $project: Object.fromEntries(select.map((key) => [key, 1])),
      });
    }

    return [
      {
        $lookup: {
          from,
          localField,
          foreignField,
          as,
          pipeline,
        },
      },
    ];
  },

  toggle(field) {
    return [{ $set: { [field]: { $eq: [false, `$${field}`] } } }];
  },

  objectID(id) {
    return new ObjectId(id);
  },

  arrayConverter(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  },

  encode(value) {
    return value ? btoa(value) : "";
  },

  decode(value) {
    return value ? atob(value) : "";
  },

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  sendError(obj) {
    throw new Error(JSON.stringify(obj));
  },

  parseError(error) {
    try {
      return JSON.parse(error.message);
    } catch {
      return utils.message;
    }
  },

  async tryFetch(func, times = 3, delay = 1000) {
    for (let attempt = 1; attempt <= times; attempt++) {
      try {
        return await func();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt < times)
          await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("All retry attempts failed");
  },

  addDate(count, date = new Date()) {
    return new Date(date.getTime() + count * 24 * 60 * 60 * 1000);
  },

  startDate(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  },

  endDate(date = new Date()) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  },

  compareDate(date1, date2 = new Date()) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getTime() >= d2.getTime();
  },

  isDev: process.env.NODE_ENV === "development",
};

module.exports = utils;
