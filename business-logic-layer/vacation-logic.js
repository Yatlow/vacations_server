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

function addTrackingAsync(uuid, vacation_id) {
    return dal.executeQueryAsync(`
        INSERT INTO tracked (uid, vacation_id) VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
        `, [uuid, vacation_id])
}

function deleteTrackingAsync(uuid, vacation_id) {
    return dal.executeQueryAsync(`
        DELETE FROM tracked WHERE uid = $1 AND vacation_id = $2
        `, [uuid, vacation_id])
}

function deleteVacationAsync(vacation_id) {
    return dal.executeQueryAsync(`
        DELETE from vacations where id= $1
        `, [vacation_id])
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
async function addVacationAsync(vacationData) {
    const lastId = await dal.executeQueryAsync(`SELECT MAX(id) FROM vacations;`, []);
    return dal.executeQueryAsync(`
        INSERT INTO vacations (id, destination, description, start_time, end_time, price, picture_url)
        values ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id;
    `, [
        lastId.rows[0].max + 1,
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