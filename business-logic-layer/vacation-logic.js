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
        INSERT INTO tracked (uid, vacationId) VALUES ($1, $2)
        `, [uuid, vacationId])
}

function deleteTrackingAsync(uuid, vacationId) {
    return dal.executeQueryAsync(`
        DELETE FROM tracked WHERE uid = $1 AND vacationId = $2
        `, [uuid, vacationId])
}

function deleteVacationAsync(vacationId) {
    return dal.executeQueryAsync(`
        DELETE from vacations where id= $1
        `, [vacationId])
}

function editVacationAsync(vacationData) {
    if (vacationData.pictureUrl) {
        return dal.executeQueryAsync(`
        UPDATE vacations SET destination=$1, description=$2, start=$3, end=$4, price=$5, pictureUrl=$6
        WHERE id=$7;
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
        UPDATE vacations SET destination=$1, description=$2, start=$3, end=$4, price=$5
        WHERE id=$6;
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
        values ($1,$2,$3,$4,$5,$6)
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