const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishIdExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}.`,
    });
};

function bodyHasNameProperty(req, res, next) {
    const { data: { name } } = req.body;
    if (name) {
      return next();
    }
    next({
      status: 400,
      message: "Dish must include a name",
    });
};

function namePropertyIsValid(req, res, next) {
    const { data: { name } } = req.body;
    const invalidResult = [''];
    if (invalidResult.includes(name)) {
        next({
            status: 400,
            message: `Dish must include a name`,
            }); 
    }
    return next();
};

function bodyHasDescriptionProperty(req, res, next) {
    const { data: { description } } = req.body;
    if (description) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a description",
    });
};

function descriptionPropertyIsValid(req, res, next) {
    const { data: { description } } = req.body;
    const invalidResult = [''];
    if (invalidResult.includes(description)) {
        next({
            status: 400,
            message: `Dish must include a description`,
            }); 
    }
    return next();
};

function bodyHasPriceProperty(req, res, next) {
    const { data: { price } } = req.body;
    if (price) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a price",
    });
};

function pricePropertyIsValid(req, res, next) {
    const { data: { price } } = req.body;
    if (typeof(price) !== 'number' || price <= 0) {
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`,
            }); 
    }
    return next();
};

function bodyHasUrlProperty(req, res, next) {
    const { data: { image_url } } = req.body;
    if (image_url) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a image_url",
    });
};

function urlPropertyIsValid(req, res, next) {
    const { data: { image_url }  } = req.body;
    const invalidResult = [''];
    if (invalidResult.includes(image_url)) {
        next({
            status: 400,
            message: `Dish must include a image_url`,
            }); 
    }
    return next();
};

function dishIdMatchesParams(req, res, next) {
    const currentDish = res.locals.dish;
    const { data: { id } } = req.body;
    if (id && id !== currentDish.id) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${currentDish.id}`,
        });
    }
    req.body.data.id = currentDish.id;
    return next();
};

function list(req, res) {
    res.json({data: dishes});
};

function read(req, res) {
    res.json({
        data: res.locals.dish,
      });
};

function create(req, res) {
    const { data: { name, description, price, image_url } } = req.body;
    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

function update(req, res) {
    const { data: { id, name, description, image_url, price } } = req.body;
  
    res.json({ data: {
        id,
        name,
        description,
        image_url,
        price
    } });
};

// Suggestion to consolidate validation functionality by using Object.entries(dict) and/or Object.values(dict); obj being a name/error-message dictionary.
module.exports = {
    list,
    read: [dishIdExists, read],
    create: [
        bodyHasNameProperty, 
        namePropertyIsValid,
        bodyHasDescriptionProperty,
        descriptionPropertyIsValid, 
        bodyHasPriceProperty,
        pricePropertyIsValid,
        bodyHasUrlProperty,
        urlPropertyIsValid,
        create
    ],
    update: [
        dishIdExists,
        dishIdMatchesParams,
        bodyHasNameProperty, 
        namePropertyIsValid,
        bodyHasDescriptionProperty,
        descriptionPropertyIsValid, 
        bodyHasPriceProperty,
        pricePropertyIsValid,
        bodyHasUrlProperty,
        urlPropertyIsValid,
        update
    ]
}