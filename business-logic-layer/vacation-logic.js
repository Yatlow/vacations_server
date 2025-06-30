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
    if (vacationData.picture_url) {
        return dal.executeQueryAsync(`
        UPDATE vacations SET destination=$1, description=$2, start_time=$3, end_time=$4, price=$5, picture_url=$6
        WHERE id=$7;
    `, [
            vacationData.destination,
            vacationData.description,
            vacationData.start_time,
            vacationData.end_time,
            vacationData.price,
            vacationData.picture_url,
            vacationData.id
        ]);
    } else {
        return dal.executeQueryAsync(`
        UPDATE vacations SET destination=$1, description=$2, start_time=$3, end_time=$4, price=$5
        WHERE id=$6;
    `, [
            vacationData.destination,
            vacationData.description,
            vacationData.start_time,
            vacationData.end_time,
            vacationData.price,
            vacationData.id
        ]);
    }
}
function addVacationAsync(vacationData) {
    const lastId= dal.executeQueryAsync(`SELECT MAX(id) FROM vacations;`,[]);
    console.log(lastId)
    return dal.executeQueryAsync(`
        INSERT INTO vacations (id, destination, description, start_time, end_time, price, picture_url)
        values ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id;
    `, [
        lastId+1,
        vacationData.destination,
        vacationData.description,
        vacationData.start_time,
        vacationData.end_time,
        vacationData.price,
        vacationData.picture_url,
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