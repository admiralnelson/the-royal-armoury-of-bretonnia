/* eslint-disable */
const fs = require('fs')
const { spawnSync } = require('child_process')
const path = require('path')
const { dir } = require('console')

const RPFM_PATH = "D:/programs/rpfm shit/"
const SCHEMA_PATH = `C:/Users/admir/AppData/Roaming/rpfm/config/schemas/schema_wh3.ron`
const PROJECT_NAME = `The_Royal_Armoury_of_Bretonnia`

spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [ `--version` ], 
{ encoding: 'utf8', stdio: 'inherit' })

try {
    fs.mkdirSync("build")
    fs.mkdirSync("temp")
} catch (error) {}

if(fs.existsSync("/build")) {
    fs.rmSync("/build", { recursive: true })
}

if(!fs.existsSync("graphics_assets.pack")) {
    throw `cannot pack! graphics_assets.pack was not found`
}

if(!fs.existsSync("items.pack")) {
    throw `cannot pack! items.pack was not found`
}

function PackGeneratedAssets(dirname) {
    dirname = dirname.replace(/\\/g, '/')
    const schemaPath = SCHEMA_PATH.replace(/\\/g, '/')

    console.log(`Packing ${dirname}...`)

    console.log(`Packing variantmeshes data...`)
    spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `${dirname}/autogenerated/variantmeshes;variantmeshes`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })
    
    console.log(`Packing thumbnails data...`)
    spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `${dirname}/autogenerated/ui;ui`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })

    console.log(`Packing compiled typescript data...`)
    spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `script/${dirname}/autogenerated/campaign/mod/;script/campaign/mod`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })

    console.log(`Packing database...`)
    const result1 = spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `${dirname}/autogenerated/db/agent_uniforms_tables`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })
    if(result1.status != 0) throw `failed to compile agent_uniform_tables to binary db`

    const result2 = spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `${dirname}/autogenerated/db/campaign_character_art_sets_tables`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })
    if(result2.status != 0) throw `failed to compile campaign_character_art_sets_tables to binary db`

    const result3 = spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `${dirname}/autogenerated/db/campaign_character_arts_tables`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })
    if(result3.status != 0) throw `failed to compile campaign_character_arts_tables to binary db`
    
    const result4 = spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `${dirname}/autogenerated/db/variants_tables`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })
    if(result4.status != 0) throw `failed to compile variants_tables to binary db`
    
    console.log(`Done for "${dirname}"`)
}

function CompileVariantMesh(folderName) {
    console.log(`building variantmeshes for "${folderName}"`)
    const result = spawnSync(`node.exe`,[
        `GenerateArmoury.js`
    ], {
        cwd: folderName,
        stdio: "inherit",
        encoding: 'utf8'
    })
    if(result.status != 0) throw `fail at compiling variantmeshes`
}

function BuildTypescriptProject() {
    console.log(`compiling typescript project`)
    fs.rmSync(`script/`, { recursive: true })
    const result = spawnSync(`build_campaign.bat`, [], {
        stdio: "inherit",
        encoding: 'utf8'
    })
    if(result.status != 0) throw `fail at compiling typescript project`
}

function InjectResourcesPack() {
    const schemaPath = SCHEMA_PATH.replace(/\\/g, '/')

    spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `create` , `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`,   
    ], {
        stdio: "inherit",
        encoding: 'utf8'
    })

    console.log(`injecting items.pack`)

    console.log(`injecting graphical assets`)
    const result = spawnSync(`node.exe`,[
        `UpdateItems.js`
    ], {
        stdio: "inherit",
        encoding: 'utf8'
    })
    if(result.status != 0) throw `fail at injecting items`

    spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `script;script`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })

    console.log(`injecting any ui`)
    spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
        '--game', 'warhammer_3', 
        'pack', 
        `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
        `-t`, `${schemaPath}`,
        `--folder-path`, `ui;ui`
    ], 
    { encoding: 'utf8', stdio: 'inherit' })

    console.log(`injecting graphical assets`)
    const result2 = spawnSync(`node.exe`,[
        `UpdateAssets.js`
    ], {
        stdio: "inherit",
        encoding: 'utf8'
    })
    if(result2.status != 0) throw `fail at injecting graphical assets`
}

//compile stage
CompileVariantMesh(`generate massif lords armour combinations`)
BuildTypescriptProject()

//packing stage
InjectResourcesPack()
PackGeneratedAssets(`generate massif lords armour combinations`)


console.log(`Complete`)


