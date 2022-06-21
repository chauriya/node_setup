const { model, Schema, connect: mongoConnect, connection: mongoConnection, ObjectId } = require('mongoose');

const uri = 'mongodb+srv://arnuser:%40rNAdm1n2021@mastermix-dbh2x.mongodb.net/ARN?retryWrites=true&w=majority';

const ApplicationMenuSchema = new Schema({
    menuid: { type: Number, index: true },
    parentmenuid: { type: Number },
    menushortname: { type: String, match: /[a-z]/ },
    menudisplayname: { type: String, match: /[a-z]/ },
    displayorder: { type: Number },
    icon: { type: String },
    haschild: { type: Boolean },
    creactedby: { type: String, match: /[a-z]/ },
    createddate: { type: Date, default: Date.now },
    modifiedby: { type: String, match: /[a-z]/ },
    modifieddate: { type: Date, default: Date.now }
});

const MenuPermissionsSchema = new Schema({
    Id: { type: Number },
    userid: { type: String, match: /[a-z]/, index: true },
    menuid: { type: Number },
    permissiontype: { type: Array },
    creactedby: { type: String, match: /[a-z]/ },
    createddate: { type: Date, default: Date.now },
    modifiedby: { type: String, match: /[a-z]/ },
    modifieddate: { type: Date, default: Date.now },
});

const PharmacyPermissionsSchema = new Schema({
    id: { type: Number },
    pharmacyid: { type: Number },
    userid: { type: String, match: /[a-z]/, index: true },
    creactedby: { type: String, match: /[a-z]/ },
    createddate: { type: Date, default: Date.now },
    modifiedby: { type: String, match: /[a-z]/ },
    modifieddate: { type: Date, default: Date.now },
});

const PharmaciesSchema = new Schema({
    id: { type: Number },
    pharmacyid: { type: Number },
    pharmacyname: { type: String, match: /[a-z]/ },
    pharmacytype: { type: String, match: /[a-z]/ },
    address1: { type: String, match: /[a-z]/ },
    address2: { type: String, match: /[a-z]/ },
    city: { type: String, match: /[a-z]/ },
    country: { type: String, match: /[a-z]/ },
    zip: { type: String, match: /[a-z]/ },
    pharmacyemail: { type: String, match: /[a-z]/ },
    pharmacyphone: { type: String, match: /[a-z]/ },
    contactperson: { type: String, match: /[a-z]/ },
    contactpersonphone1: { type: String, match: /[a-z]/ },
    contactpersonphone2: { type: String, match: /[a-z]/ },
    creactedby: { type: String, match: /[a-z]/ },
    createddate: { type: Date, default: Date.now },
    modifiedby: { type: String, match: /[a-z]/ },
    modifieddate: { type: Date, default: Date.now },
});

const DrugsSchema = new Schema({
    id: { type: Number },
    pharmacyid: { type: Number },
    RxCUI: { type: Number },
    RxAUI: { type: Number },
    source: { type: String },
    sourceabbreviation: { type: String },
    termtype: { type: String },
    termname: { type: String },
    strength: { type: String },
    doseform: { type: String },
    brandname: { type: String },
    drugname: { type: String },
    drugtype: { type: String },
    availableqty: { type: Number },
    createdby: { type: String, match: /[a-z]/ },
    createddate: { type: Date, default: Date.now },
    modifiedby: { type: String, match: /[a-z]/ },
    modifieddate: { type: Date, default: Date.now },
});

const InventorystockSchema = new Schema({
    id : { type: Number },
    drugid : { type: ObjectId },
    openingbalance : { type: Number },
    qtyin : { type: Number },
    qtyinout : { type: Number },
    endingbalance : { type: Number },
    createdby: { type: String, match: /[a-z]/ },
    createddate: { type: Date, default: Date.now },
    modifiedby: { type: String, match: /[a-z]/ },
    modifieddate: { type: Date, default: Date.now },
});

const InventorystockHistorySchema = new Schema({
    id : { type: Number },
    drugid : { type: ObjectId },
    openingbalance : { type: Number },
    qtyin : { type: Number },
    qtyinout : { type: Number },
    endingbalance : { type: Number },
    createdby: { type: String, match: /[a-z]/ },
    createddate: { type: Date, default: Date.now },
    modifiedby: { type: String, match: /[a-z]/ },
    modifieddate: { type: Date, default: Date.now },
});

if (mongoConnection.readyState !== 1) {
    mongoConnect(uri, { useNewUrlParser: true });
    db = mongoConnection;
}
module.exports = {
    ApplicationMenuSchema: model('applicationmenu', ApplicationMenuSchema, 'applicationmenu'),
    MenuPermissionsSchema: model('menupermissions', MenuPermissionsSchema),
    PharmacyPermissionsSchema: model('pharmacypermissions', PharmacyPermissionsSchema),
    PharmaciesSchema: model('pharmacies', PharmaciesSchema),
    DrugsSchema: model('drugs', DrugsSchema),
    InventorystockSchema: model('inventorystock', InventorystockSchema, 'inventorystock'),
    InventorystockHistorySchema: model('inventorystockhistory', InventorystockHistorySchema, 'inventorystockhistory'),
}