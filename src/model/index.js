const dbObj = require('../config/connection');

const updateDrug = async (userid, data) => {
  try {
    const now = new Date();
    return await dbObj.DrugsSchema.updateOne({
      _id: data._id,
    }, {
      $set: {
        availableqty: data.availableqty,
        modifiedby: userid,
        modifieddate: now.toISOString(),
      },
    }, {
      multi: false,
      upsert: false,
    });
  } catch (err) {
    return err;
  }
}

const updateInventoryStock = async (userid, data) => {
  try {
    const now = new Date();
    const inventoryStockResult = await dbObj.InventorystockSchema.updateOne({
      _id: data.inventoryStockId,
    }, {
      $set: {
        openingbalance: data.openingbalance,
        qtyin: data.qtyin,
        qtyinout: data.qtyinout,
        endingbalance: data.endingbalance,
        modifiedby: userid,
        modifieddate: now.toISOString(),
      },
    }, {
      multi: false,
      upsert: false,
    });
    await createInventoryStockHistory(userid, data);
    return inventoryStockResult;
  } catch (err) {
    return err;
  }
}

const createInventoryStock = async (userid, data) => {
  try {
    const now = new Date();
    const inventory = {
      drugid: data._id,
      openingbalance: data.openingbalance,
      qtyin: data.qtyin,
      qtyinout: data.qtyinout,
      endingbalance: data.endingbalance,
      createdby: userid,
      createddate: now.toISOString(),
      modifiedby: userid,
      modifieddate: now.toISOString()
    }
    const inventoryStock = new dbObj.InventorystockSchema(inventory);
    const inventoryStockResult = await inventoryStock.save();
    await createInventoryStockHistory(userid, data);
    return inventoryStockResult;
  } catch (err) {
    return err;
  }
}

const createInventoryStockHistory = async (userid, data) => {
  try {
    const now = new Date();
    const inventory = {
      drugid: data._id,
      openingbalance: data.openingbalance,
      qtyin: data.qtyin,
      qtyinout: data.qtyinout,
      endingbalance: data.endingbalance,
      createdby: userid,
      createddate: now.toISOString(),
      modifiedby: userid,
      modifieddate: now.toISOString()
    }
    const inventoryStockHistory = new dbObj.InventorystockHistorySchema(inventory);
    return await inventoryStockHistory.save();
  } catch (err) {
    return err;
  }
}

module.exports = {
  updateDrug,
  updateInventoryStock,
  createInventoryStock,
  createInventoryStockHistory
}