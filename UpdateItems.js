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
    throw `cannot update items! ${ `build/@autogenerated_${PROJECT_NAME}.pack`} is not found. Perhaps the project never built?`
}

if(!fs.existsSync("items.pack")) {
    throw `cannot update items! items.pack is not found`
}

console.log(`extracting items so they can be added...`)
spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
    '--game', 'warhammer_3', 
    'pack', 
    `extract` , `--folder-path`, `/;temp`,
    `--pack-path` , `items.pack`,   
], {
    stdio: "inherit",
    encoding: 'utf8'
})

console.log(`adding extracted items`)
spawnSync(`${RPFM_PATH}/rpfm_cli.exe`, [
    '--game', 'warhammer_3', 
    'pack', 
    `add`, `--pack-path` , `build/@autogenerated_${PROJECT_NAME}.pack`, 
    `-t`, `${schemaPath}`,
    `--folder-path`, `temp`
], 
{ encoding: 'utf8', stdio: 'inherit' })
console.log(`cleaning up`)
fs.rmSync(`temp/`, { recursive: true })

console.log(`items has been updated`)