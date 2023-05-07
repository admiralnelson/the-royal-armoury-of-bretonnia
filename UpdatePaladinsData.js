/* eslint-disable */
const fs = require('fs')
const { spawnSync } = require('child_process')
const path = require('path')

const RPFM_PATH = "D:/programs/rpfm shit/"
const SCHEMA_PATH = `C:/Users/admir/AppData/Roaming/rpfm/config/schemas/schema_wh3.ron`
const PROJECT_NAME = `The_Royal_Armoury_of_Bretonnia`
const schemaPath = SCHEMA_PATH.replace(/\\/g, '/')

try {
    fs.mkdirSync("temp")
} catch (error) {}


if(!fs.existsSync( `build/@autogenerated_${PROJECT_NAME}.pack`)) {
    throw `cannot update paladin data! ${ `build/@autogenerated_${PROJECT_NAME}.pack`} is not found. Perhaps the project never built?`
}

if(!fs.existsSync("@autogenerated_Generic_Paladin_Packs.pack")) {
    throw `cannot update paladin data! @autogenerated_Generic_Paladin_Packs.pack is not found`
}

console.log(`adding extracted items`)
spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
    '--game', 'warhammer_3', 
    'pack', 
    `merge`, `--save-pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
    `--source-pack-paths`, `@autogenerated_Generic_Paladin_Packs.pack`
], 
{ encoding: 'utf8', stdio: 'inherit' })

console.log(`paladin data has been updated`)