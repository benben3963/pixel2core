//   ___ _         _ ___ ___             
//  | _ (_)_ _____| |_  ) __|___ _ _ ___ 
//  |  _/ \ \ / -_) |/ / (__/ _ \ '_/ -_)
//  |_| |_/_\_\___|_/___\___\___/_| \___|
//
//  Made By benben3963
//
//  Name: pixel2core.js
//  Description: The file that turns the image files into pbt files.
//  Author: benben3963
//

const getpixels = require('get-pixels');

module.exports = ([imageLocation, imageName, objectType='planedouble'], callback) => {
    getpixels(imageLocation, async function(err, pixels) {
        if (err) { //Errors
            callback(
                false,
                {
                    code: 'p2c_01',
                    message: err.message
                }
            )
            return
        };

        if (imageName.match("^[A-Za-z0-9]+$")) {} else { //ImageName has special characters.
            callback(
              false,
              {
                code: 'p2c_02',
                message: 'Property "imageName" contains characters other than letters and numbers.'
              }
            )
            return
        }

        if (imageName.length > 64) { //ImageName is longer than 64.
            callback(
              false,
              {
                code: 'p2c_03',
                message: 'Property "imageName" is longer than 64 digits.'
              }
            )
            return
        }

        if (pixels.shape[0]*pixels.shape[1] > 4096) { //Image has less than 4,096 pixels. 225000 is real max.
          callback(
            false,
            {
              code: 'p2c_04',
              message: 'Image pixel count is larger than 64x64.'
            }
          )
          return
        }

        if (objectType !== 'cube' && objectType !== 'planesingle' && objectType !== 'planedouble') {
          callback(
            false,
            {
              code: 'p2c_06',
              message: 'Property "objectType" is not a valid object type.'
            }
          )
          return
        }

        //Value Types
        //ID = 15-20 Decimal Digits with No Leading Zero (IDs CAN NEVER BE THE SAME OR ELSE CORE DIES)
        //CoreString = Alphabetical Characters Only String with Max Length of 64 Characters

        let pbtData = {
            templateId: Number((Math.floor(Math.random() * Math.pow(10, 12)) + "").substring(0, 10)), //ID
            templateName: imageName, //CoreString
            rootId: Number((Math.floor(Math.random() * Math.pow(10, 12)) + "").substring(0, 10)), //ID
            parentId: Number((Math.floor(Math.random() * Math.pow(10, 12)) + "").substring(0, 10)) //ID
        }

        let pixelArray = []

        function tosRGB(value) {
          if (value/255 <= 0.04045) {
            return value / 255 / 12.92
          } else {
            return Math.pow((value / 255 + 0.055) / 1.055, 2.4)
          };
        };

        for (let y = 0; y < pixels.shape[1]; y++) {
            let row = []
            for (let x = 0; x < pixels.shape[0]; x++) {
                let pixelColor = [
                  tosRGB(pixels.data[y*pixels.shape[0]*4+x*4]),
                  tosRGB(pixels.data[y*pixels.shape[0]*4+x*4+1]),
                  tosRGB(pixels.data[y*pixels.shape[0]*4+x*4+2]),
                  tosRGB(pixels.data[y*pixels.shape[0]*4+x*4+3]),
                  1
                ];
                row.push(pixelColor)
            };
            pixelArray.push(row)
        };

        var arraysMatch = function (arr1, arr2) {
            //https://gomakethings.com/how-to-check-if-two-arrays-are-equal-with-vanilla-js/
            // Check if the arrays are the same length
            if (arr1.length !== arr2.length) return false;
        
            // Check if all items exist and are in the same order
            for (var i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) return false;
            }
        
            // Otherwise, return true
            return true;
        
        };

        pixelArray.forEach((y, yIndex) => {
            let previousPixel = [256,256,256,256]
            y.forEach((x, xIndex) => {
                if (arraysMatch([previousPixel[0],previousPixel[1],previousPixel[2],previousPixel[3]], [x[0],x[1],x[2],x[3]])) {
                    previousPixel[4] = previousPixel[4] + 1
                    x[3] = 0
                } else {
                    previousPixel = x
                }
            });
        });

        let objectAssetType = {
          name: 'Plane 1m - Two Sided',
          id: 'sm_plane_1m_002',
          productid: 1111111111
        }

        if (objectType == 'cube') {
          objectAssetType = {
            name: 'Cube',
            id: 'sm_cube_002',
            productid: 5555555555
          }
        } else if (objectType == 'planesingle') {
          objectAssetType = {
            name: 'Plane 1m - One Sided',
            id: 'sm_plane_1m_001',
            productid: 6666666666
          }
        }

        let childIds = []

        for (let i = 1; i < pixels.shape[0] * pixels.shape[1] + 1; i++) {
            childIds.push(Number((Math.floor(Math.random() * Math.pow(10, 12)) + "").substring(0, 10)))
        }

        let index4Life = 0

        let objs = ''

        pixelArray.forEach((y, yIndex) => {
            y.forEach((x, xIndex) => {
                if (x[3]/255 == 0) {} else {
                    let obj = `      Objects {
        Id: ${childIds[index4Life]}
        Name: "X${xIndex}Y${yIndex}"
        Transform {
          Location {
            Y: ${-pixels.shape[1]*5+xIndex*10+(x[4]-1)*5}
            Z: ${-yIndex*10+pixels.shape[0]*10-5}
          }
          Rotation {
            Pitch: 90
          }
          Scale {
            X: 0.1
            Y: ${0.1*x[4]}
            Z: 0.1
          }
        }
        ParentId: ${pbtData.rootId}
        UnregisteredParameters {
          Overrides {
            Name: "ma:Shared_BaseMaterial:color"
            Color {
              R: ${x[0]}
              G: ${x[1]}
              B: ${x[2]}
              A: ${x[3]}
            }
          }
          Overrides {
            Name: "ma:Shared_BaseMaterial:id"
            AssetReference {
              Id: 2222222222
            }
          }
        }
        Collidable_v2 {
          Value: "mc:ecollisionsetting:inheritfromparent"
        }
        Visible_v2 {
          Value: "mc:evisibilitysetting:inheritfromparent"
        }
        CoreMesh {
          MeshAsset {
            Id: ${objectAssetType.productid}
          }
          Teams {
            IsTeamCollisionEnabled: true
            IsEnemyCollisionEnabled: true
          }
          EnableCameraCollision: true
          StaticMesh {
            Physics {
            }
          }
        }
      }\n`
                    objs = objs + obj
                    index4Life = index4Life + 1
                }
            });
        });

        childIds.splice(index4Life, childIds.length)

        let stringedChildIds = ''

        childIds.forEach(element => {
            stringedChildIds = stringedChildIds + (`\n        ChildIds: ${element}`)
        });
        
        let pbt = `Assets {
  Id: ${pbtData.templateId}
  Name: "${pbtData.templateName}"
  PlatformAssetType: 5
  TemplateAsset {
    ObjectBlock {
      RootId: ${pbtData.rootId}
      Objects {
        Id: ${pbtData.rootId}
        Name: "Group"
        Transform {
          Scale {
            X: 1
            Y: 1
            Z: 1
          }
        }
        ParentId: ${pbtData.parentId}${stringedChildIds}
        ChildIds: 3333333333
        Collidable_v2 {
          Value: "mc:ecollisionsetting:inheritfromparent"
        }
        Visible_v2 {
          Value: "mc:evisibilitysetting:inheritfromparent"
        }
        Folder {
          IsGroup: true
        }
      }
${objs}      Objects {
        Id: 3333333333
        Name: "Credits"
        Transform {
          Location {
          }
          Rotation {
          }
          Scale {
            X: 1
            Y: 1
            Z: 1
          }
        }
        ParentId: ${pbtData.rootId}
        Collidable_v2 {
          Value: "mc:ecollisionsetting:inheritfromparent"
        }
        Visible_v2 {
          Value: "mc:evisibilitysetting:inheritfromparent"
        }
        Script {
          ScriptAsset {
            Id: 4444444444
          }
        }
      }
    }
    Assets {
      Id: ${objectAssetType.productid}
      Name: "${objectAssetType.name}"
      PlatformAssetType: 1
      PrimaryAsset {
        AssetType: "StaticMeshAssetRef"
        AssetId: "${objectAssetType.id}"
      }
    }
    Assets {
      Id: 2222222222
      Name: "Basic Material"
      PlatformAssetType: 2
      PrimaryAsset {
        AssetType: "MaterialAssetRef"
        AssetId: "mi_basic_pbr_material_001"
      }
    }
    Assets {
      Id: 4444444444
      Name: "Credits"
      PlatformAssetType: 3
      TextAsset {
        Text: "--   ___ _         _ ___ ___             \\r\\n--  | _ (_)_ _____| |_  ) __|___ _ _ ___ \\r\\n--  |  _/ \\\\ \\\\ / -_) |/ / (__/ _ \\\\ \\'_/ -_)\\r\\n--  |_| |_/_\\\\_\\\\___|_/___\\\\___\\\\___/_| \\\\___|\\r\\n--\\r\\n--  Made By Player1\\r\\n--  pixel2core.player1.xyz\\r\\n--\\r\\n--  This model was made with Pixel2Core and must adhere with the license provided bellow.\\r\\n--\\r\\n--  This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. \\r\\n--  To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or \\r\\n--  send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.\\r\\n--\\r\\n--  This Credits notice must remain in the model if redistributed in any medium.\\r\\n--"
      }
    }
    PrimaryAssetId {
      AssetType: "None"
      AssetId: "None"
    }
  }
  SerializationVersion: 62
}
IncludesAllDependencies: true`
        
        
callback(
  true,
  pbt
)
    });
};
