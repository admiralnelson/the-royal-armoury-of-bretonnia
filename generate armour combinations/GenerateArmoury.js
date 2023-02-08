const fs = require('fs')

function GetAllAvailableAssets() {
    const csv = fs.readFileSync('AssetIdsToTheActualAssetFilenames.csv', 'utf-8').replace(/\r/g, "")
    const lines = csv.split("\n")
    const headers = lines[0].split(",")

    const result = lines.slice(1).reduce((acc, line) => {
        const values = line.split(",")
        const obj = {}
        headers.forEach((header, i) => {
            obj[header] = values[i]
        })
        acc[obj.AssetId] = obj.AssetPath
        return acc
    }, {})

    return result
}

const AVAILABLE_ASSETS = GetAllAvailableAssets()

function GenerateBasicArmourySetIds() {
    const csv = fs.readFileSync('FaceAndBasicLooks.csv', 'utf-8').replace(/\r/g, "")
    
    const rows = csv.split("\n")
    const headers = rows[0].split(",")
    const data = rows.slice(1).map(row => {
        const values = row.split(",");
        return headers.reduce((result, header, index) => {
            const value = values[index]
            if(!AVAILABLE_ASSETS[value]) throw (`${value} is not defined in AssetIdsToTheActualAssetFilenames`)
            result[header] = value
            return result
        }, {})
        })
    
    const result = []
    for (const row of data) {
        result.push(`ArmourySystem__${row["FaceId"]}__${row["HelmetId"]}__${row["ArmourId"]}__${row["WeaponId"]}__${row["ShieldId"]}`)
    }
    return result
}

function GetBasicArmourSet() {
    const csv = fs.readFileSync('FaceAndBasicLooks.csv', 'utf-8').replace(/\r/g, "")
    
    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    const result = {};
    headers.forEach(header => {
    result[header] = [];
    });

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        headers.forEach((header, index) => {
            result[header].push(values[index]);
        });
    }

    return result

}

function GetArmoursAndWeaponsLists() {
    const csv = fs.readFileSync('ListOfArmoursAndWeapons.csv', 'utf-8').replace(/\r/g, "")
    
    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    const result = {};
    headers.forEach(header => {
    result[header] = [];
    });

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        headers.forEach((header, index) => {
            result[header].push(values[index]);
        });
    }

    return result
}

function GetFaceToAgentType() {
    const csv = fs.readFileSync('FaceToAgentType.csv', 'utf-8').replace(/\r/g, "")
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    let result = {};
  
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }
      result[currentLine[0]] = obj;
    }
  
    return result;
}

function GenerateCombinations() {
    const faces = GetBasicArmourSet()["FaceId"]
    const armours = GetArmoursAndWeaponsLists()
    const result = []
    for (const face of faces) {
        for (const helmet of armours["HelmetId"]) {
            for (const armour of armours["ArmourId"]) {
                for (const weapon of armours["WeaponId"]) {
                    for (const shield of armours["ShieldId"]) {
                        const x = `ArmourySystem__${face}__${helmet}__${armour}__${weapon}__${shield}`
                        result.push(x)
                    }
                }
            }
        }   
    }

    return result
}

function GenerateXMLFromIds(xmlname, basicIds, combinationsIds) {
    console.log(`Generating xml...`)
    //generate thumbnails with basic armour
    let entries = `
    <!-- BASIC THUMBNAILS STARTS HERE -->
    `
    for (const id of basicIds) {
        const entry = `
        <Entry id="${id}">
            <CameraSettings>
                <Distance_Head>0.8</Distance_Head>
                <Theta_Head>0</Theta_Head>
                <Phi_Head>0</Phi_Head>
                <FoV_Head>0</FoV_Head>
                <Distance_2>30</Distance_2>
                <Distance_Body>4</Distance_Body><!--optional-->
                <Theta_Body>0</Theta_Body><!--optional-->
                <Phi_Body>0</Phi_Body><!--optional-->
                <FoV_Body>0</FoV_Body><!--optional-->
                <Distance_2_Body>30</Distance_2_Body><!--optional-->
            </CameraSettings>
        <Variants>
			<Variant id="${id}">
                <FileDiffuse>UI/Portraits/Portholes/ArmourySystem/${id}.png</FileDiffuse>
                <FileMask1></FileMask1> <!--All three masks are optional-->
                <FileMask2></FileMask2>	<!--All three masks are optional-->
                <FileMask3></FileMask3>	<!--All three masks are optional-->
            </Variant>
        </Variants>
        </Entry>
        `
        entries += entry
    }
    entries += `
    <!-- BASIC THUMBNAILS ENDS HERE -->
    `

    for (combinationId of combinationsIds) {
        const faceId = combinationId.split("__").slice(0, 2).join("__")
        const basicId = basicIds.find( id => id.includes(faceId) )
        const entry = `
        <Entry id="${combinationId}">
            <CameraSettings>
                <Distance_Head>0.8</Distance_Head>
                <Theta_Head>0</Theta_Head>
                <Phi_Head>0</Phi_Head>
                <FoV_Head>0</FoV_Head>
                <Distance_2>30</Distance_2>
                <Distance_Body>4</Distance_Body><!--optional-->
                <Theta_Body>0</Theta_Body><!--optional-->
                <Phi_Body>0</Phi_Body><!--optional-->
                <FoV_Body>0</FoV_Body><!--optional-->
                <Distance_2_Body>30</Distance_2_Body><!--optional-->
            </CameraSettings>
        <Variants>
			<Variant id="${combinationId}">
                <FileDiffuse>UI/Portraits/Portholes/ArmourySystem/${basicId}.png</FileDiffuse>
                <FileMask1></FileMask1> <!--All three masks are optional-->
                <FileMask2></FileMask2>	<!--All three masks are optional-->
                <FileMask3></FileMask3>	<!--All three masks are optional-->
            </Variant>
        </Variants>
        </Entry>
        `
        entries += entry
    }

    const template = `
    <?xml version="1.0" encoding="UTF-8"?>
    <PortraitSettings version="4">
        ${entries}
    </PortraitSettings>
    `

    fs.writeFileSync(`portrait_settings__autogenerated_${xmlname}.xml`, template)
}

//campaign_character_art_sets_tables
function GenerateCampaignCharacterArtSetsTables(tableName, faceToAgentTypes, basicIds, combinationsIds) {
    let   header = `art_set_id	agent_type	culture	subculture	faction	is_custom	is_male	agent_subtype	campaign_map_scale\n`
          header+= `#campaign_character_art_sets_tables;6;db/campaign_character_art_sets_tables/@@@autogenerated_${tableName}								`

    
    //basic looks thumbnail db entries
    let entries = ``
    for (const basicId of basicIds) {
        const faceId = basicId.split("__")[1]
        const lordCultureData = faceToAgentTypes[faceId]
        const entry = `${basicId}\t${lordCultureData["AgentType"]}\t${lordCultureData["Culture"]}\t\t\tfalse\ttrue\t${lordCultureData["AgentSubType"]}\t1.000\n`
        entries += entry
    }

    //customisable armours db entries
    for (const combinationId of combinationsIds) {
        const faceId = combinationId.split("__")[1]
        const lordCultureData = faceToAgentTypes[faceId]
        const entry = `${combinationId}\t${lordCultureData["AgentType"]}\t${lordCultureData["Culture"]}\t\t\tfalse\ttrue\t${lordCultureData["AgentSubType"]}\t1.000\n`
        entries += entry
    }

    const tsv = `${header}\n${entries}`
    fs.writeFileSync(`@@@autogenerated_${tableName}.tsv`, tsv)
}

function GenerateVariantMeshDefinitions(basicIds, combinationsIds) {
    const directory = "variantmeshes/variantmeshdefinitions/autogenerated/";
    if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    }
}

GenerateXMLFromIds("bretonnia_royal_armoury", GenerateBasicArmourySetIds(), GenerateCombinations())
GenerateCampaignCharacterArtSetsTables("bretonnia_royal_armoury", GetFaceToAgentType(), GenerateBasicArmourySetIds(), GenerateCombinations())
//GenerateCombinations()