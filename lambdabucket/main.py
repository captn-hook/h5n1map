import pandas as pd
import json
import requests
import boto3


# CHANGE ME # =====================================
s3_client = boto3.client('s3')
sourceBucket = ''
destinationBucket = ''
# =================================================

# data file names, this program will get stuck if names are wrong
animalFile = "combined_H5N1_animal_surveillance_data.csv"
humanFile = "H5N1_human_surveillance_data.csv"
statecodesFile = "states.csv"
countycodesFile = "countycodes.csv"

combined_file = 'combined_data.json'

def compare_recursive(l1, l2, max, index=0):
    maxIndex = 2
    # compares index, if they are equal, compare the next index
    if l1[index] == l2[index]:
        if index == maxIndex:
            # they are completely equal
            return l1
        else:
            return compare_recursive(l1, l2, max, index + 1)
    else:
        if max:
            if l1[index] > l2[index]:
                # l1 is greater
                return l1
            else:
                return l2
        else:
            if l1[index] < l2[index]:
                # l1 is less
                return l1
            else:
                return l2

def date_comparison(row, max=True):
    # check columns:
    d1 = "date_occurred_low_end"
    d2 = "date_occurred_high_end"
    d3 = "date_detected"

    # dates are in the format: year-mt-dy
    date1 = row[d1].split("-")
    date2 = row[d2].split("-")
    date3 = row[d3].split("-")

    # compare 1 and 2
    date = compare_recursive(date1, date2, max)
    # compare date and 3
    return compare_recursive(date, date3, max)


def create_json(animal, human, statecodes, countycodes):
    # read data
    animal_data = pd.read_csv(animal)
    # data_summary(animal_data, 'Animal Data')

    human_data = pd.read_csv(human)
    # data_summary(human_data, 'Human Data')

    statecodes_data = pd.read_csv(statecodes)
    countycodes_data = pd.read_csv(countycodes)

    # remove "APHIS - HPAI Detections in " from the source column
    animal_data["source"] = animal_data["source"].str.replace("APHIS - HPAI Detections in ", "")

    # change 'Mammals' source to 'Wildlife'
    animal_data["source"] = animal_data["source"].str.replace("Mammals", "Wildlife")

    # replace 'Livestock' with 'Dairy Farms'
    animal_data["source"] = animal_data["source"].str.replace("Livestock", "Dairy Farms")
    
    # replace 'Commercial and Backyard Flocks' with 'Poultry Farms'
    animal_data["source"] = animal_data["source"].str.replace("Commercial and Backyard Flocks", "Poultry Farms")

    # change unicode hyphens to normal hyphens
    animal_data["county"] = animal_data["county"].str.replace("–", "-")

    # change Clarke County to Clark County, only in washington
    clarkwa = animal_data[
        (animal_data["county"] == "Clarke") & (animal_data["state"] == "Washington")
    ]
    animal_data.loc[
        (animal_data["county"] == "Clarke") & (animal_data["state"] == "Washington"),
        "county",
    ] = "Clark"

    # change Stutsman and Dickey South Dakota to North Dakota
    # find stutsman
    animal_data.loc[animal_data["county"] == "Stutsman", "state"] = "North Dakota"
    animal_data.loc[animal_data["county"] == "Dickey", "state"] = "North Dakota"
    
    # change Kewanee to Kewaunee
    animal_data["county"] = animal_data["county"].str.replace("Kewanee", "Kewaunee")

    # sometimes a space in DeSoto and LaSalle (there are more than one)
    # Louisiana De Soto
    animal_data.loc[
        (animal_data["county"] == "DeSoto") & (animal_data["state"] == "Louisiana"),
        "county",
    ] = "De Soto"
    # ms and fl DeSoto
    animal_data.loc[
        (animal_data["county"] == "De Soto") & (animal_data["state"] == "Mississippi"),
        "county",
    ] = "DeSoto"
    animal_data.loc[
        (animal_data["county"] == "De Soto") & (animal_data["state"] == "Florida"),
        "county",
    ] = "DeSoto"

    # Illinois LaSalle
    animal_data.loc[
        (animal_data["county"] == "La Salle") & (animal_data["state"] == "Illinois"),
        "county",
    ] = "LaSalle"

    # Texas and louisiana La Salle
    animal_data.loc[
        (animal_data["county"] == "LaSalle") & (animal_data["state"] == "Texas"),
        "county",
    ] = "La Salle"
    animal_data.loc[
        (animal_data["county"] == "LaSalle") & (animal_data["state"] == "Louisiana"),
        "county",
    ] = "La Salle"

    # Matanuska Susitna to Matanuska-Susitna
    animal_data["county"] = animal_data["county"].str.replace("Matanuska Susitna", "Matanuska-Susitna")

    # Chugach to Valdez-Cordova, as they were split in 2019
    animal_data["county"] = animal_data["county"].str.replace("Chugach", "Valdez-Cordova")

    # Matanuska-Sustina to Matanuska-Susitna
    animal_data["county"] = animal_data["county"].str.replace("Matanuska-Sustina", "Matanuska-Susitna")

    # Saint Croix to St Croix
    animal_data["county"] = animal_data["county"].str.replace("Saint Croix", "St Croix")

    # St. Mary to St Mary
    animal_data["county"] = animal_data["county"].str.replace("St. Mary", "St Mary")

    # Rensselear to Rensselaer
    animal_data["county"] = animal_data["county"].str.replace("Rensselear", "Rensselaer")

    # Burnet to Burnett
    animal_data["county"] = animal_data["county"].str.replace("Burnet", "Burnett")

    # Burnettt to Burnett
    animal_data["county"] = animal_data["county"].str.replace("Burnettt", "Burnett")
    
    # St Mary's MD to St Mary
    animal_data.loc[
        (animal_data["county"] == "St Mary's") & (animal_data["state"] == "Maryland"),
        "county",
    ] = "St Mary"

    # Wanship to Summit (Wanship is a census-designated place in Summit County, Utah)
    animal_data.loc[
        (animal_data["county"] == "Wanship") & (animal_data["state"] == "Utah"),
        "county",
    ] = "Summit"

    # replace Macon Ohio with Brown ( macon is a region in brown county)
    animal_data.loc[
        (animal_data["county"] == "Macon") & (animal_data["state"] == "Ohio"), "county"
    ] = "Brown"

    # Wade Hampton to Kusilvak
    animal_data.loc[
        (animal_data["county"] == "Wade Hampton Census Area") & (animal_data["state"] == "Alaska"),
        "county",
    ] = "Kusilvak"

    # Shenandoah Texas to Montgomery
    animal_data.loc[
        (animal_data["county"] == "Shenandoah") & (animal_data["state"] == "Texas"),
        "county",
    ] = "Montgomery"
    # Mile Lacs to Mille Lacs
    animal_data["county"] = animal_data["county"].str.replace("Mile Lacs", "Mille Lacs")

    # Le Sneur to Le Sueur
    animal_data["county"] = animal_data["county"].str.replace("Le Sneur", "Le Sueur")

    # Bloomington Indiana to Monroe
    animal_data.loc[
        (animal_data["county"] == "Bloomington") & (animal_data["state"] == "Indiana"),
        "county",
    ] = "Monroe"

    # replace michigan with Michigan
    animal_data["state"] = animal_data["state"].str.replace("michigan", "Michigan")

    # state : 51, 50 states and DC
    
    # we can remove guid column``, it represents the same as year
    human_data["pathogen"] = human_data["pathogen"].str.replace("Novel Influenza A (H5N1)_United States_", "")
    #human_data.drop("event_guid", axis=1, inplace=True)

    # can remove these columns, its all influenza
    # human_data.drop(["disease", "pathogen"], axis=1, inplace=True)

    # change date reported to match animal data
    human_data.rename(columns={"date_reported": "date_detected"}, inplace=True)
    # if date high or low matches reported, set to none

    # can remove this column because all US
    human_data.drop("country", axis=1, inplace=True)

    # rename admin areato state
    human_data.rename(columns={"administrative_area_level_1": "state"}, inplace=True)
    human_data.rename(columns={"administrative_area_level_2": "county"}, inplace=True)

    # create a source column for human and fill with "Human"
    human_data["source"] = "Human"

    human_locations = {}

    def comp_date_arr(date1, date2):
        # if date1 < date2, return True
        # dates are arrays of year, month, day
        for i in range(3):
            if date1[i] < date2[i]:
                return True
            elif date1[i] > date2[i]:
                return False
            else:
                # they are equal, continue
                continue
        # they are equal
        return True

    for index, row in human_data.iterrows():
        # locations can be county level or state level, disregard country level
        # (and we have some states that have county level data and state level data)
        if pd.isna(row["state"]):
            continue
        state = row["state"]
        if pd.isna(row["county"]):
            key = state
        else:
            key = f"{state}, {row['county']}"

        if key not in human_locations:
            human_locations[key] = {
                "date_max": date_comparison(row, True),
                "date_min": date_comparison(row, False),
                "cuml_cases": int(row["cuml_cases"]),
            }
            print("Added human to date:", human_locations[key]["date_max"])
        elif comp_date_arr(human_locations[key]["date_max"], date_comparison(row, True)):
            human_locations[key] = {
                "date_max": date_comparison(row, True),
                "date_min": date_comparison(row, False),
                "cuml_cases": int(row["cuml_cases"]),
            }
        else:
            print("older data found: ", key)
            print(human_locations[key]["date_max"])
            print(row)
    # create a new human data sheet
    hd = pd.DataFrame(columns=animal_data.columns)
    for key, value in human_locations.items():
        if ", " in key:
            state, county = key.split(", ")
        else:
            state = key
            county = ""
        date_max = "-".join(value["date_max"])
        date_min = "-".join(value["date_min"])
        cuml_cases = value["cuml_cases"]
        # print(f"Adding {cuml_cases} cases from {key}")
        for i in range(cuml_cases):
            # pd has no append method, so we have to create a new row and append it
            # we have date_occurred_low_end, date_occurred_high_end, source, state, county (county can be '')
            row = {
                "date_occurred_low_end": date_min,
                "date_occurred_high_end": date_max,
                "source": "Human",
                "state": state,
                "county": county,
                "cuml_cases": human_locations[key]["cuml_cases"],
            }
            hd = pd.concat([hd, pd.DataFrame(row, index=[0])], ignore_index=True)

    # compile the human and animal data
    # change all dtypes to string
    # animal_data = animal_data.astype(str)
    # hd = hd.astype(str)
    
    # replace NaN with empty string
    # animal_data.fillna("", inplace=True)
    # hd.fillna("", inplace=True)

    combined_data = pd.concat([animal_data, hd], ignore_index=True)

    # add state abbreviations column to combined data
    combined_data = combined_data.merge(
        statecodes_data, left_on="state", right_on="state", how="left")
    combined_data.drop("state", axis=1, inplace=True)

    # for counties that have a comma then a space, remove it and all after it
    combined_data["county"] = combined_data["county"].str.split(", ").str[0]

    # Standardize county names in countycodes_data
    remove = [
        " City and Borough",
        " County",
        " Borough",
        " Parish",
        " Municipality",
        " City",
        " Census Area",
        ".",
        " city",
        " town",
        " village",
        " Municipio",
    ]

    exempt = ['Baltimore city', 'St Louis city', 'Roanoke city']
    placeholders = ['bbcitay', 'stankloosecitay', 'rownokokocitay']

    for i, e in enumerate(exempt):
        countycodes_data["county"] = countycodes_data["county"].str.replace(e, placeholders[i])
        combined_data["county"] = combined_data["county"].str.replace(e, placeholders[i])

    for r in remove:
        countycodes_data["county"] = countycodes_data["county"].str.replace(r, "")
        combined_data["county"] = combined_data["county"].str.replace(r, "")

    
    for i, p in enumerate(placeholders):
        countycodes_data["county"] = countycodes_data["county"].str.replace(p, exempt[i])
        combined_data["county"] = combined_data["county"].str.replace(p, exempt[i])

    countycodes_data["county"] = countycodes_data["county"].str.strip().str.lower()

    # remove periods from the county codes sheet
    countycodes_data["county"] = countycodes_data["county"].str.replace(".", "")

    # Ensure county codes are 5 char strings, prepend 0 if necessary
    countycodes_data["id"] = countycodes_data["id"].astype(str)
    countycodes_data["id"] = countycodes_data["id"].apply(lambda x: x.zfill(5))

    # Standardize county names in combined_data
    combined_data["county"] = combined_data["county"].str.strip().str.lower()

    # Merge combined_data with countycodes_data
    combined_data = combined_data.merge(
        countycodes_data,
        left_on=["county", "abbreviation"],
        right_on=["county", "abbreviation"],
        how="left",)
    # report any that nan county

    # report any abbreviations that are not 2 letters

    # re capitalize the county names
    combined_data["county"] = combined_data["county"].str.title()

    # Identify columns with NaN values
    nan_columns = combined_data.columns[combined_data.isna().any()].tolist()
    # Cast these columns to object dtype
    combined_data[nan_columns] = combined_data[nan_columns].astype(object)
    
    # Replace NaN with empty string
    combined_data.fillna("", inplace=True)

    # remove .0 from cuml_cases
    combined_data["cuml_cases"] = (
        combined_data["cuml_cases"].astype(str).str.replace(".0", ""))

    # Write the combined data to a CSV
    # combined_data.to_csv("./combined_data.csv", index=False)

    # make a json file with this heirarchy: county -> source -> list of data
    json_data = {}
    sources = combined_data["source"].unique()

    for county, county_data in combined_data.groupby("id"):
        json_data[county] = {}
        for source in sources:
            json_data[county][source] = []

        # set name to county_data name from id
        json_data[county]["name"] = county_data["county"].iloc[0]

    # Write each row to its corresponding county and source
    for index, row in combined_data.iterrows():
        county = row["id"]
        source = row["source"]

        # Convert the row to a comma-separated string
        row_str = ",".join(row.astype(str))

        if county == "":
            if row.source != "Dairy Farms" and row.source != "Human":
                print("Failed to find county code for row")
                print(row.source, ' | ', row.county, ' | ', row.abbreviation, ' | ', row.id)
                # remove row
                continue
                # raise ValueError("county is empty")

        # Initialize the nested dictionary if it doesn't exist
        if county not in json_data:
            json_data[county] = {}
        if source not in json_data[county]:
            json_data[county][source] = []

        # Append the row string to the list
        json_data[county][source].append(row_str)

    return json_data


def main(animalF, humanF, stateF, countyF):
    # retrieve data from local dir
    try:
        jsondata = create_json(animalF, humanF, stateF, countyF)

        # then we would want to save a .json to the bucket
        # but for now we will write to folder
        with open('/tmp/' + combined_file, 'w') as f:
            json.dump(jsondata, f, indent=4)

        return '/tmp/' + combined_file
    
    except Exception as e:
        return {
            'statuscode': 500,
            'body': 'Data processing error?'
        }
    
def lambda_handler(event, context):

    try:

        s3_client.download_file(sourceBucket, animalFile, '/tmp/' + animalFile)
        s3_client.download_file(sourceBucket, humanFile, '/tmp/' + humanFile)
        s3_client.download_file(sourceBucket, humanFile, '/tmp/' + statecodesFile)
        s3_client.download_file(sourceBucket, humanFile, '/tmp/' + countycodesFile)

        outputFile = main('/tmp/' + animalFile, '/tmp/' + humanFile, '/tmp/' + statecodesFile, '/tmp/' + countycodesFile)

        if outputFile == None:
            return {

            }
    
        s3_client.upload_file(outputFile, destinationBucket, combined_file)

        return {
            'satuscode': 200,
            'body': 'Success!'
        }
    except:
        return {
            'statuscode': 500,
            'body': 'S3 Error?'
        }

if __name__ == "__main__":
    js = create_json('./' + animalFile, './' + humanFile, './' + statecodesFile, './' + countycodesFile)

    with open('./' + combined_file, 'w') as f:
        json.dump(js, f, indent=4)