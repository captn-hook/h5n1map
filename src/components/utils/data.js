import pool from "@/components/utils/db";
import updateData from "@/components/utils/updateData";
// trys to import the most up-to-date version of the data
// but has a fallback to the old data if the new data is not available or corrupted

import oldData from '../../../public/data/combined_data.json';
import oldHumanData from '../../../public/data/H5N1_human_surveillance_data.csv';
import oldAnimalData from '../../../public/data/combined_h5n1_animal_surveillance_data.csv';

export default async function getData() {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT * FROM files WHERE name = $1', ['combined_data.json']);
        if (res.rows.length === 0) {
            console.error('Could not find data in db');
            return oldData;
        }
        const data = res.rows[0].data;
        client.release();
        const txt = new TextDecoder().decode(data);
        return JSON.parse(txt);
    } catch (e) {
        console.error('Could not fetch data from db', e);
        return oldData;
    }
}

function objlist(data) {
    // convert csv to list of objects with keys from the first row
    const lines = data.split('\n');
    const keys = lines[0].split(',');
    // strip /r from last key
    keys[keys.length - 1] = keys[keys.length - 1].replace('\r', '');
    lines.shift();
    const objs = [];
    for (let line of lines) {
        // strip /r from last value
        line = line.replace('\r', '');
        const obj = {};
        const values = line.split(',');
        for (let i = 0; i < keys.length; i++) {
            if (values[i] === undefined) {
                obj[keys[i]] = '';
            } else {
                obj[keys[i]] = values[i];
            }
        }
        // if all values are empty, skip the row
        if (Object.values(obj).every(v => v === '')) {
            continue;
        } else {
            objs.push(obj);
        }
    }
    return objs;
}

export async function updateDB() {
    // fetch the files from the database and fallback to the old files if the new files are not available
    const client = await pool.connect();

    // human data
    var human;
    try {
        const res = await client.query('SELECT * FROM files WHERE name = $1', ['H5N1_human_surveillance_data.csv']);
        human = res.rows[0].data;
        human = new TextDecoder().decode(human);    
        human = objlist(human);
    } catch (e) {
        human = oldHumanData;
    }
    var animal;
    try {
        const res = await client.query('SELECT * FROM files WHERE name = $1', ['combined_h5n1_animal_surveillance_data.csv']);
        animal = res.rows[0].data;
        animal = new TextDecoder().decode(animal);    
        animal = objlist(animal);
    } catch (e) {
        animal = oldAnimalData;
    }
    
    // client.release();
    // return;
    var json;
    try {
        json = await updateData(human, animal);
    } catch (e) {
        console.error('Error updating data', e);
        return false;
    }

    if (!json) {
        console.error('Error updating data');
        return false;
    }

    try {
        await client.query(
            `INSERT INTO files (name, data) VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data`,
            ['combined_data.json', json]
        );
    } catch (error) {
        console.error('Error inserting file', error);
        return false;
    } finally {
        client.release();
        return true;
    }
}