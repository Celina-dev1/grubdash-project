const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderIdExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${orderId}`,
    });
};

function orderIdMatchesParams(req, res, next) {
    const currentOrder = res.locals.order;
    const { data: { id } } = req.body;
    if (id && id !== currentOrder.id) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${currentOrder.id}.`,
        });
    }
    req.body.data.id = currentOrder.id;
    return next();
};

function bodyHasDeliverToProperty(req, res, next) {
    const { data: { deliverTo } } = req.body;
    if (deliverTo) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include a deliverTo",
    });
};

function deliverToPropertyIsValid(req, res, next) {
    const { data: { deliverTo } } = req.body;
    const invalidResult = [''];
    if (invalidResult.includes(deliverTo)) {
        next({
            status: 400,
            message: "Order must include a deliverTo",
            }); 
    }
    return next();
};

function bodyHasMobileNumberProperty(req, res, next) {
    const { data: { mobileNumber } } = req.body;
    if (mobileNumber) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
};

function mobileNumberPropertyIsValid(req, res, next) {
    const { data: { mobileNumber } } = req.body;
    const invalidResult = [''];
    if (invalidResult.includes(mobileNumber)) {
        next({
            status: 400,
            message: "Order must include a mobileNumber",
            }); 
    }
    return next();
};

function bodyHasDishesProperty(req, res, next) {
    const { data: { dishes } } = req.body;
    if (dishes) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include a dish",
    });
};

function dishesPropertyIsValid(req, res, next) {
    const { data: { dishes } } = req.body;
    if (!Array.isArray(dishes) || dishes.length === 0) {
        next({
            status: 400,
            message: "Order must include at least one dish",
            }); 
    }
    return next();
};

function dishesHasQuantityProperty(req, res, next) {
    const { data: { dishes }} = req.body;
    dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || typeof(dish.quantity) !== 'number') {
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`,
              });
        }
        return;
    }) 
    return next();
};


function orderHasValidStatus(req, res, next) {
    const { data: { status }} = req.body;
    const validResponse = ['pending', 'preparing', 'out-for-delivery', 'delivered']
    if (!status || !validResponse.includes(status)) {
        next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
          });
    } 
    else if (status === 'delivered') {
        next({
            status: 400,
            message: `A delivered order cannot be changed`,
          });
    }
    return next();
};


function orderIsPending(req, res, next) {
    const currentOrder = res.locals.order;

    if (currentOrder.status === 'pending') {
        return next();
        
    } 
    next({
        status: 400,
        message: `An order cannot be deleted unless it is pending`,
      });
};


function list(req, res) {
    res.json({data: orders});
};


function read(req, res) {
    res.json({
        data: res.locals.order,
      });
};


function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } } = req.body;
    const newOrder = {
      id: nextId(),
      deliverTo,
      mobileNumber,
      status,
      dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};


function update(req, res) {
    const { data: { id, deliverTo, mobileNumber, status, dishes } } = req.body;
  
    res.json({ data: {
        id,
        deliverTo,
        mobileNumber,
        status,
        dishes
    } });
};


function destroy(req, res) {
    const currentOrder = res.locals.order;
    const index = orders.findIndex((order) => order.id === currentOrder.id);
    orders.splice(index, 1);
    
    res.sendStatus(204);
};

module.exports = {
    list,
    read: [
        orderIdExists, 
        read
    ],
    create: [
        bodyHasDeliverToProperty,
        deliverToPropertyIsValid,
        bodyHasMobileNumberProperty,
        mobileNumberPropertyIsValid,
        bodyHasDishesProperty,
        dishesPropertyIsValid,
        dishesHasQuantityProperty,
        create
    ],
    update: [
        orderIdExists,
        orderIdMatchesParams,
        bodyHasDeliverToProperty,
        deliverToPropertyIsValid,
        bodyHasMobileNumberProperty,
        mobileNumberPropertyIsValid,
        bodyHasDishesProperty,
        dishesPropertyIsValid,
        dishesHasQuantityProperty,
        orderHasValidStatus,
        update
    ],
    delete: [
        orderIdExists, 
        orderIsPending, 
        destroy
    ],
}
