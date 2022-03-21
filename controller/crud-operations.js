/**
 *   createDoc
 *   * Create document based on object and add into schema/collection
 *
 *   @param schema: in which collection/schema do you want to add this document? (Model)
 *   @param object: what are you adding into this schema? (object)
 **/
const createDoc = async (schema, object) => {
    return new Promise((resolve, reject) => {
        const doc = new schema(object);

        doc.save((err) => {
            if (err) reject(err);
            console.log(`New doc added to db`);
            resolve(doc);
        });
    });
};

/**
 *   createMultipleDocs
 *   * Create multiple documents with array of objects and add into schema/collection
 *
 *   @param schema: in which collection/schema do you want to add these documents? (Model)
 *   @param objects: what are you adding into this schema? ([objects])
 **/
const createMultipleDocs = async (schema, objects) => {
    return new Promise((resolve, reject) => {
        schema.insertMany(objects, (err, result) => {
            if (err) reject(err);
            console.log(`Multiple docs added to db`);
            resolve(result);
        });
    });
};

/**
 *   findDocByQuery
 *   * Locate specific document in a collection and return said document
 *
 *   @param schema: in which collection/schema should the doc you're locating be in? (Model)
 *   @param attribute: how do you want to locate this document? (String)
 *   @param equalTo: what should the attribute be equal to? (String) or (ObjectId)
 **/
const findDocByQuery = async (schema, attribute, equalTo) => {
    return new Promise((resolve, reject) => {
        schema.find({
            [`${attribute}`]: {
                '$eq': equalTo,
                '$exists': true
            }
        }, (err, result) => {
            if (err) reject(err);

            if (!result.length) {
                console.log(`doc not found in db`);
            } else {
                result.forEach((doc) => {
                    console.log(`doc found in db`);
                    resolve(doc);
                });
            }
        });
    });
};

/**
 *   AddIdReferenceToDoc
 *   * Update one or multiple documents from a certain schema with one or more reference ids 
 *
 *   @param schemaToFind: in which collection/schema is the document you want to update located? (Model)
 *   @param docIds: what is the id of the to be updated document? (ObjectId) or ([ObjectId])
 *   @param referenceSchemas: which attribute of the to be updated document are you updating? (String)
 *   @param referenceSchemas: which reference id are you adding into the attribute? (ObjectId) or ([ObjectId])
 **/
const addIdReferenceToDoc = async (schemaToFind, docIds, referenceSchemas, referenceIds) => {

    // one doc to be updated with single id
    if (!Array.isArray(docIds) && !Array.isArray(referenceIds)) {
        await findDocByQuery(schemaToFind, `_id`, docIds).then((doc) => {
            doc[referenceSchemas].push(referenceIds);
            doc.save();
            console.log(`reference id added to doc`);
        });

        // one doc to be updated with multiple ids
    } else if (!Array.isArray(docIds) && Array.isArray(referenceIds)) {

        for (let id in referenceIds) {
            await findDocByQuery(schemaToFind, `_id`, docIds).then((doc) => {
                doc[referenceSchemas].push(id);
                doc.save();
                console.log(`multiple reference ids added to doc`);
            });
        }

        // multiple docs to be updated with single id
    } else if (Array.isArray(docIds) && !Array.isArray(referenceIds)) {

        for (let id of docIds) {
            await findDocByQuery(schemaToFind, `_id`, id).then((doc) => {
                doc[referenceSchemas].push(referenceIds);
                doc.save();
                console.log(`reference id added to multiple docs`);
            });
        }

    // multiple docs to be updated with multiple ids
    } else {
        for (let id of docIds) {
            await findDocByQuery(schemaToFind, `_id`, id).then((doc) => {
                for (let id in referenceIds) {
                    doc[referenceSchemas].push(id);
                    doc.save();
                    console.log(`multiple reference ids added to multiple docs`);
                }
            });
        }
    }
};

module.exports = {
    createDoc,
    createMultipleDocs,
    findDocByQuery,
    addIdReferenceToDoc
};