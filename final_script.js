// UPLOAD IMAGES TO PINATA: Receive the images folder on computer.
const Web3 = require("web3");
const web3 = new Web3;
const { post } = require('axios');
const path = require('path')
const { createReadStream, outputJsonSync } = require('fs-extra');
const { read } = require('recursive-fs');
const FormData = require('form-data');
const basePathConverter = require('base-path-converter');

require('dotenv').config();

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;

const { log, error } = console;

const PINATA_API_PINFILETOIPFS = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

let IMG_FOLDER_CID;

let the_store = path.resolve(process.argv[2]);
console.log((the_store));
let the_folder = the_store.split("/")[the_store.split("/").length-1];

// UPLOAD ALL THE IMAGES TO PINATA
(async () => {
  try {
    const IMGS_OUTPUT_PATH = path.resolve(`${process.argv[2]}/pinata/nftsImages_${the_folder}`);//`./pinata/nftsImages_${the_folder}`;
    const IMGS_FOLDER_NAME = `nftsImages_${the_folder}`; // Display name of folder in Pinata
    //const FOLDER_PATH = 'metadata'; // Folder to be uploaded
    //const FOLDER_PATH = path.resolve(process.cwd(), process.argv[2]); // Folder to be uploaded
    const IMGS_FOLDER_PATH = path.resolve(process.argv[2]); // Folder to be uploaded
    const { files } = await read(IMGS_FOLDER_PATH);
    if ((files && files.length) <= 0) {
      log(`No files were found in folder '${IMGS_FOLDER_PATH}'`);
      return;
    }
    log(`'${IMGS_FOLDER_PATH}' upload started`);
    const formData = new FormData();
    files.forEach((filePath) => {
      log(`Adding file: ${filePath}`);
      formData.append('file', createReadStream(filePath), {
        filepath: basePathConverter(IMGS_FOLDER_PATH, filePath),
      });
    });
    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: IMGS_FOLDER_NAME,
      }),
    );
    const {
      data: { IpfsHash: cid },
    } = await post(PINATA_API_PINFILETOIPFS, formData, {
      maxBodyLength: 'Infinity',
      headers: {
        // eslint-disable-next-line no-underscore-dangle
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    log(`'${IMGS_FOLDER_PATH}' upload complete; IMG_FOLDER_CID: ${cid}`);
    IMG_FOLDER_CID = cid;
    //log(`The URI for the contract is -----> ipfs://${cid}/{id}`)
    outputJsonSync(path.resolve(`${IMGS_OUTPUT_PATH}`), { [IMGS_FOLDER_NAME]: cid });
  } catch (err) {
    error(err);
    process.exit(1);
  }

  setTimeout(createMetadata, 1500);
})();

//CREATES METADATA FOLDER WITH THE METADATA FOR EACH IMAGE
async function createMetadata(){

  const IMGS_FOLDER_PATH = path.resolve(process.argv[2]);
  const folder_name = IMGS_FOLDER_PATH.split("/")[IMGS_FOLDER_PATH.split("/").length-1];
  console.log('folder name',folder_name)
  try {
    console.log("Im trying");
    //Get all the images from images folder
    var {files} = await read(IMGS_FOLDER_PATH)
    function theFunction(file, index){
      const metadata_name = web3.utils.padLeft(web3.utils.numberToHex(index),64).split('0x')[1].toLowerCase()
      //Creates metadata for each image and saves it in a folder called metadata under img folder 
      modified_metadata = {
        "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.", 
        "external_url": "https://goblockchain.io", 
        "image": `ipfs://${IMG_FOLDER_CID}/${path.basename(file)}`, 
        "name": `Dave Starbelly #${index}`,
        "attributes": [
          {
            "trait_type": "Base", 
            "value": "Starfish"
          }, 
          {
            "trait_type": "Eyes", 
            "value": "Big"
          }, 
          {
            "trait_type": "Mouth", 
            "value": "Surprised"
          }, 
          {
            "trait_type": "Level", 
            "value": "5"
          }, 
          {
            "trait_type": "Stamina", 
            "value": "1.4"
          }, 
          {
            "trait_type": "Personality", 
            "value": "Sad"
          }, 
          {
            "display_type": "boost_number", 
            "trait_type": "Aqua Power", 
            "value": "40"
          }, 
          {
            "display_type": "boost_percentage", 
            "trait_type": "Stamina Increase", 
            "value": "10"
          }, 
          {
            "display_type": "number", 
            "trait_type": "Generation", 
            "value": "2"
          }
        ]
      }
      outputJsonSync(path.resolve(`${process.argv[2]}/${folder_name}_metadata/${metadata_name}`), modified_metadata);            
    }
    files.forEach(theFunction);
    //console.log(files)
    console.log('DONE!')
  }
  catch (err) {
    console.error(err)
  }
  setTimeout(uploadMetadata, 1500);
};

//UPLOAD ALL METADATA TO PINATA
async function uploadMetadata(){
  let METADATA_FOLDER_CID;
  try {

    const IMGS_FOLDER_PATH = path.resolve(process.argv[2]);
    const folder_name = IMGS_FOLDER_PATH.split("/")[IMGS_FOLDER_PATH.split("/").length-1];  

    const METADATA_OUTPUT_PATH = path.resolve(`${process.argv[2]}/pinata/metadata_${the_folder}`);//`./pinata/metadata_${the_folder}`;
    const METADATA_FOLDER_NAME = `metadata_${the_folder}`; // Display name of folder in Pinata
    //const FOLDER_PATH = 'metadata'; // Folder to be uploaded
    //const FOLDER_PATH = path.resolve(process.cwd(), process.argv[2]); // Folder to be uploaded
    const METADATA_FOLDER_PATH = path.resolve('/home/caiosa/', `${process.argv[2]}/${folder_name}_metadata`); // Folder to be uploaded
    const { files } = await read(METADATA_FOLDER_PATH);
    if ((files && files.length) <= 0) {
      log(`No files were found in folder '${METADATA_FOLDER_PATH}'`);
      return;
    }
    log(`'${METADATA_FOLDER_PATH}' upload started`);
    const formData = new FormData();
    files.forEach((filePath) => {
      log(`Adding file: ${filePath}`);
      formData.append('file', createReadStream(filePath), {
        filepath: basePathConverter(METADATA_FOLDER_PATH, filePath),
      });
    });
    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: METADATA_FOLDER_NAME,
      }),
    );
    const {
      data: { IpfsHash: cid },
    } = await post(PINATA_API_PINFILETOIPFS, formData, {
      maxBodyLength: 'Infinity',
      headers: {
        // eslint-disable-next-line no-underscore-dangle
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    log(`'${METADATA_FOLDER_PATH}' upload complete; METADATA_FOLDER_CID: ${cid}`);
    METADATA_FOLDER_CID = cid;
    log(`The URI for the contract is -----> ipfs://${cid}/{id}`)
    outputJsonSync(path.resolve(`${METADATA_OUTPUT_PATH}`), { [METADATA_FOLDER_NAME]: cid });
  } catch (err) {
    error(err);
    process.exit(1);
  }
};