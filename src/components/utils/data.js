'use client';
import backupData from '../../../public/data/combined_data.json'

export default async function getData() {
    
    let lastUpdated;
    try {
        // get last updated date from backup file
        const d = await fetch('/h5n1-map/data/combined_data.json', {cache: 'no-store'}).then(res => {
            return res.headers.get('last-modified')
        })
        lastUpdated = new Date(d).toLocaleString()
        
    } catch (error) {
        console.error(error)
        console.log('Failed to get last updated date')
        lastUpdated = 'Unknown'
    }

    try {
        const url = process.env.NEXT_PUBLIC_BUCKET_URL + process.env.NEXT_PUBLIC_FILE_NAME;
        const res = await fetch(url, {
            //mode: 'no-cors',
            headers: {
                'Cache-Control': 'max-age=3600' // Cache for 1 hour
            }
        });
        if (res.status === 200) {

            const updated = new Date(res.headers.get('last-modified')).toLocaleString()

            console.log('Data fetched from bucket with last updated: ' + updated)

            const data = await res.json()
            return[data, updated, process.env.NEXT_PUBLIC_USE_LAST_UPDATED === 'true']
        } else {
            console.log('Response was not 200, using backup data')
            return [backupData, lastUpdated, true]
        }
    } catch (error) {
        console.error(error)
        console.log('Failed to fetch data from bucket, using backup data')
        return [backupData, lastUpdated, true]
    }
}