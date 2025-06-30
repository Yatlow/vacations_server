const dal = require("../data-access-layer/dal");

function getAllVacationsAsync() {
    return dal.executeQueryAsync(`
        select * from vacations
    `);
};
function getAllTrackingsAsync() {
    return dal.executeQueryAsync(`
        select * from tracked
    `);
};

function addTrackingAsync(uuid, vacationId) {
    return dal.executeQueryAsync(`
        INSERT INTO tracked (uid, vacationId) VALUES (?, ?)
        `, [uuid, vacationId])
}

function deleteTrackingAsync(uuid, vacationId) {
    return dal.executeQueryAsync(`
        DELETE FROM tracked WHERE uid = ? AND vacationId = ?
        `, [uuid, vacationId])
}

function deleteVacationAsync(vacationId) {
    return dal.executeQueryAsync(`
        DELETE from vacations where id= ?
        `, [vacationId])
}

function editVacationAsync(vacationData) {
    if (vacationData.pictureUrl) {
        return dal.executeQueryAsync(`
        UPDATE vacations SET destination=?, description=?, start=?, end=?, price=?, pictureUrl=?
        WHERE id=?;
    `, [
            vacationData.destination,
            vacationData.description,
            vacationData.start,
            vacationData.end,
            vacationData.price,
            vacationData.pictureUrl,
            vacationData.id
        ]);
    } else {
        return dal.executeQueryAsync(`
        UPDATE vacations SET destination=?, description=?, start=?, end=?, price=?
        WHERE id=?;
    `, [
            vacationData.destination,
            vacationData.description,
            vacationData.start,
            vacationData.end,
            vacationData.price,
            vacationData.id
        ]);
    }
}
function addVacationAsync(vacationData) {
    return dal.executeQueryAsync(`
        INSERT INTO vacations (destination, description, start, end, price, pictureUrl)
        values (?,?,?,?,?,?)
    `, [
        vacationData.destination,
        vacationData.description,
        vacationData.start,
        vacationData.end,
        vacationData.price,
        vacationData.pictureUrl,
    ]);

}



module.exports = {
    getAllVacationsAsync,
    getAllTrackingsAsync,
    addTrackingAsync,
    deleteTrackingAsync,
    deleteVacationAsync,
    editVacationAsync,
    addVacationAsync,
}