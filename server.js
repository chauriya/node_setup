const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dbObj = require('./src/config/connection');
const model = require('./src/model');
const app = express();
const port = process.env.PORT || 3080;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(process.cwd() + '/client/dist'));

app.get('/api/getMenuPermissionsByUser/:userid', async (req, res) => {
  const menuItems = await dbObj.ApplicationMenuSchema.find({}).sort({ displayorder: 1 });
  const menuPermission = await dbObj.MenuPermissionsSchema.find({ "userid": req.params.userid });
  const result = [];
  menuItems.forEach((menuItem) => {
    const menuPerm = menuPermission.find(permission => {
      const perm = { ...permission };
      return perm._doc.menuId === menuItem.menuid
    });
    if (menuPerm) {
      result.push({ ...menuItem._doc, permissiontype: menuPerm.permissiontype })
    }
  });
  res.json(result);
});

app.get('/api/getPharmacyByUser/:userid', async (req, res) => {
  const pharmacyPermissions = await dbObj.PharmacyPermissionsSchema.distinct("pharmacyid", { "userid": req.params.userid });
  const pharmacies = await dbObj.PharmaciesSchema.find({ "pharmacyid": pharmacyPermissions });
  res.json(pharmacies);
});

app.get('/api/getDrugsByPharmacy/:pharmacyid', async (req, res) => {
  const drugs = await dbObj.DrugsSchema.aggregate([
    {
      $lookup: {
        from: 'pharmacies',
        localField: 'pharmacyid',
        foreignField: 'pharmacyid',
        as: 'pharmacy',
      },
    },
    { $unwind: { path: '$pharmacy', preserveNullAndEmptyArrays: true, }, },
    {
      $lookup: {
        from: 'inventorystock',
        localField: '_id',
        foreignField: 'drugid',
        as: 'inventorystock',
      },
    },
    { $unwind: { path: '$inventorystock', preserveNullAndEmptyArrays: true, }, },
    {
      $match: { "pharmacyid": parseInt(req.params.pharmacyid) },
    },
    {
      $group: {
        _id: { $min: '$_id' },
        pharmacyname: { $min: '$pharmacy.pharmacyname' },
        pharmacyid: { $min: '$pharmacyid' },
        strength: { $min: '$strength' },
        drugtype: { $min: '$drugtype' },
        drugname: { $min: '$drugname' },
        RxCUI: { $min: '$RxCUI' },
        RxAUI: { $min: '$RxAUI' },
        source: { $min: '$source' },
        sourceabbreviation: { $min: '$sourceabbreviation' },
        termtype: { $min: '$termtype' },
        termname: { $min: '$termname' },
        doseform: { $min: '$doseform' },
        brandname: { $min: '$brandname' },
        availableqty: { $min: '$availableqty' },
        createdby: { $min: '$createdby' },
        createddate: { $min: '$createddate' },
        modifiedby: { $min: '$modifiedby' },
        modifieddate: { $min: '$modifieddate' },
        openingbalance: { $min: '$inventorystock.openingbalance' },
        qtyin: { $min: '$inventorystock.qtyin' },
        qtyinout: { $min: '$inventorystock.qtyinout' },
        endingbalance: { $min: '$inventorystock.endingbalance' },
        inventoryStockId: { $min: '$inventorystock._id' },
      },
    },
    {
      $addFields: {
        drugTerm: { $concat: ["$termname", " (", "$termtype", ")"] },
      }
    }
  ]);
  res.json(drugs);
});

app.get('/api/searchDrug/:userid', async (req, res) => {
  const pharmacyPermissions = await dbObj.PharmacyPermissionsSchema.distinct("pharmacyid", { "userid": req.params.userid });
  const drugname = req.query.drugname ? { "drugname": { $regex: new RegExp(req.query.drugname, "i") } } : {};
  const drugs = await dbObj.DrugsSchema.aggregate([
    {
      $lookup: {
        from: 'pharmacies',
        localField: 'pharmacyid',
        foreignField: 'pharmacyid',
        as: 'pharmacy',
      },
    },
    { $unwind: { path: '$pharmacy', preserveNullAndEmptyArrays: true, }, },
    {
      $lookup: {
        from: 'inventorystock',
        localField: '_id',
        foreignField: 'drugid',
        as: 'inventorystock',
      },
    },
    { $unwind: { path: '$inventorystock', preserveNullAndEmptyArrays: true, }, },
    {
      $match: { ...req.query, ...drugname, "pharmacyid": { "$in": pharmacyPermissions } },
    },
    {
      $group: {
        _id: { $min: '$_id' },
        pharmacyname: { $min: '$pharmacy.pharmacyname' },
        pharmacyid: { $min: '$pharmacyid' },
        strength: { $min: '$strength' },
        drugtype: { $min: '$drugtype' },
        drugname: { $min: '$drugname' },
        RxCUI: { $min: '$RxCUI' },
        RxAUI: { $min: '$RxAUI' },
        source: { $min: '$source' },
        sourceabbreviation: { $min: '$sourceabbreviation' },
        termtype: { $min: '$termtype' },
        termname: { $min: '$termname' },
        doseform: { $min: '$doseform' },
        brandname: { $min: '$brandname' },
        availableqty: { $min: '$availableqty' },
        createdby: { $min: '$createdby' },
        createddate: { $min: '$createddate' },
        modifiedby: { $min: '$modifiedby' },
        modifieddate: { $min: '$modifieddate' },
        openingbalance: { $min: '$inventorystock.openingbalance' },
        qtyin: { $min: '$inventorystock.qtyin' },
        qtyinout: { $min: '$inventorystock.qtyinout' },
        endingbalance: { $min: '$inventorystock.endingbalance' },
        inventoryStockId: { $min: '$inventorystock._id' },
      },
    },
    {
      $addFields: {
        drugTerm: { $concat: ["$termname", " (", "$termtype", ")"] },
      }
    }
  ]);
  res.json(drugs);
});

app.get('/api/list/drug/:field', async (req, res) => {
  const drugs = await dbObj.DrugsSchema.aggregate([
    { $unwind: `$${req.params.field}` },
    { $match: {} },
    {
      $group: {
        _id: `$${req.params.field}`
      }
    }
  ]);
  res.json(drugs);
});

app.post('/api/addDrug/:userid', async (req, res) => {
  const pharmacies = await dbObj.PharmaciesSchema.find({}, { pharmacyid: 1 });
  const now = new Date();
  const drugdata = pharmacies.map(({ pharmacyid }) => {
    return {
      availableqty: 0,
      ...req.body,
      pharmacyid,
      createdby: req.params.userid,
      createddate: now.toISOString(),
      modifiedby: req.params.userid,
      modifieddate: now.toISOString()
    }
  });
  const result = await dbObj.DrugsSchema.insertMany(drugdata);
  res.json(drugdata);
});

app.post('/api/updateDrug/:userid', async (req, res) => {
  const now = new Date();
  try {
    console.log(req.body.inventoryStockId, !!req.body.inventoryStockId);
    let inventoryResult = { _id: req.body.inventoryStockId };
    if (!!req.body.inventoryStockId) {
      await model.updateInventoryStock(req.params.userid, req.body);
    } else {
      inventoryResult = await model.createInventoryStock(req.params.userid, req.body);
    }
    await model.updateDrug(req.params.userid, req.body);
    res.json(inventoryResult);
  } catch (err) {
    res.json(err);
  };
});

app.delete('/api/deleteDrugById/:id', async (req, res) => {
  try {
    await dbObj.DrugsSchema.deleteOne({ _id: req.params.id });
    const result = await dbObj.InventorystockSchema.deleteOne({ drugid: req.params.id });
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

app.get('/*', (req, res) => {
  res.sendFile(process.cwd() + '/client/dist/index.html');
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});