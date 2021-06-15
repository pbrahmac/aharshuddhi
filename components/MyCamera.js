import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions, Platform, Image, ScrollView } from "react-native";
import { Camera } from "expo-camera";
import CameraPreview from './CameraPreview';

const MyCamera = () => {
    //blacklist
    const myBlacklist = ["onion", "garlic", "eggs", "gelatin"]

    //camera permissions
    const [hasPermission, setHasPermission] = useState(null)
    const [camera, setCamera] = useState(null)

    //Screen Ratio and image padding
    const [imagePadding, setImagePadding] = useState(0)
    const [ratio, setRatio] = useState('4:3')
    const { height, width } = Dimensions.get('window')
    const screenRatio = height / width
    const [isRatioSet, setIsRatioSet] = useState(false)

    //ask for camera permission and set state accordingly
    const __startCamera = async () => {
        const { status } = await Camera.requestPermissionsAsync()
        setHasPermission(status === 'granted')
    }

    //set camera ratio and padding
    const prepareRatio = async () => {
        let desiredRatio = '4:3'
        if (Platform.OS === 'android') {
            const ratios = await camera.getSupportedRatiosAsync()

            //calculate width / height of supported ratios
            let distances = {}
            let realRatios = {}
            let minDistance = null
            for (const ratio of ratios) {
                const parts = ratio.split(':')
                const realRatio = parseInt(parts[0]) / parseInt(parts[1])
                realRatios[ratio] = realRatio

                const distance = screenRatio - realRatio
                distances[ratio] = realRatio
                if (minDistance == null) {
                    minDistance = ratio
                } else {
                    if (distance >= 0 && distance < distances[minDistance]) {
                        minDistance = ratio
                    }
                }
            }
            desiredRatio = minDistance
            const remainder = Math.floor((height - realRatios[desiredRatio] * width) / 2)

            //set padding
            setImagePadding(remainder / 2)
            setRatio(desiredRatio)
            setIsRatioSet(true)
        }
    }

    const setCameraReady = async () => {
        if (!isRatioSet) {
            await prepareRatio()
        }
    }

    //take picture hooks
    const [previewVisible, setPreviewVisible] = useState(false)
    const [capturedImage, setCapturedImage] = useState(null)

    //take picture function
    const __takePicture = async () => {
        if (!camera) {
            return
        }
        const photo = await camera.takePictureAsync({quality: 1, base64: true})
        setPreviewVisible(true)
        setCapturedImage(photo)
        console.log(photo)
    }

    // useEffect(() => {
    //     console.log("after effect ", capturedImage)
    // }, [capturedImage])

    //retake picture function
    const __retakePicture = () => {
        setCapturedImage(null)
        setPreviewVisible(false)
        __startCamera()
    }

    //photo analytics hooks
    const [picSaved, setPicSaved] = useState(false)
    const [ingredientList, setIngredientList] = useState("")
    const [edible, setEdible] = useState(false)
    const [inedibleItem, setInedibleItem] = useState("")

    //save photo
    let flag = true

    const __savePhoto = async () => {
        setPicSaved(true)
        const conc = 'data:image/jpeg;base64,' + capturedImage.base64
        console.log(conc)
        const formData = new FormData()
        formData.append("base64Image", conc)
        formData.append("filetype", "jpg")
        formData.append("scale", true)
        formData.append("OCREngine", 2)
        const requestOptions = {
            method: 'POST',
            headers: { 'apiKey': '7a7ce0e34088957'},
            body: formData
        }

        const response = await fetch('https://api.ocr.space/parse/image', requestOptions)
        const data = await response.json()
        console.log(data)
        if (data.IsErroredOnProcessing) {
            return "Couldn't analyze"
        } else {
            const ingredientList = data.ParsedResults[0].ParsedText
            console.log(ingredientList)
            setIngredientList(ingredientList)
            setEdible(checkEdible(ingredientList, myBlacklist))
            flag = checkEdible(ingredientList, myBlacklist)
        }
    }

    const checkEdible = (ingredients, blacklist) => {
        blacklist.forEach(item => {
            console.log(item)
            console.log(ingredients.toLowerCase().search(item))
            console.log(ingredients.toLowerCase().search(item) > -1)
            if (ingredients.toLowerCase().search(item) > -1) {
                setInedibleItem(item)
                return false
            }
        });
        return true
    }

    return (
        <View style={styles.container}>
            {hasPermission ? (
                <View style={{ flex: 1, width: '100%' }}>
                    {previewVisible && capturedImage ? (
                        <View style={{ flex: 1 }}>
                            {ingredientList !== "" ? (
                                <ScrollView style={{ flex: 1, backgroundColor: flag ? '#d0f1bf' : '#ff8785'}}>
                                    <View style={{ flex: 1, margin: 50, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                                        
                                        <Text
                                            style={{ color: '#000', fontSize: 50, textAlign: 'center'}}
                                        >
                                            {flag ? "You can eat this!" : `You can't eat this, it has ${inedibleItem} in it.`}
                                        </Text>
                                        <Text
                                            style={{ color: '#000', fontSize: 20, textAlign: 'center'}}
                                        >
                                            {ingredientList}
                                        </Text>
                                        <TouchableOpacity
                                            style={{
                                                // width: 130,
                                                marginTop: 20,
                                                borderRadius: 4,
                                                backgroundColor: '#14274e',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: 40
                                            }}
                                            onPress={() => {
                                                setHasPermission(hasPermission === true ? false : true)
                                                setIngredientList("")
                                                setPreviewVisible(false)
                                                setCapturedImage(null)
                                                setInedibleItem("")
                                            }}
                                        >
                                            <Text style={{color: '#fff', fontSize: 20}}>Go Home</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                </ScrollView>
                            ): (
                                <CameraPreview photo={capturedImage} savePhoto={__savePhoto} retakePicture={__retakePicture} />
                            )}
                        </View>
                    ) : (
                        <Camera

                            style={[styles.camera, { marginTop: imagePadding, marginBottom: imagePadding }]}
                            type={Camera.Constants.Type.back}
                            onCameraReady={setCameraReady}
                            ratio={ratio}
                            ref={(ref) => {
                            setCamera(ref)
                            }}>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={{flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end'}}
                                    onPress={() => {
                                        setHasPermission(hasPermission === true ? false : true)
                                    }}>
                                        <Text style={styles.text}>❎</Text>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 10,
                                        flexDirection: 'row',
                                        flex: 1,
                                        width: '100%',
                                        padding: 20,
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <View
                                        style={{
                                            alignSelf: 'center',
                                            flex: 1,
                                            alignItems: 'center',
                                            zIndex: 50
                                        }}
                                        >
                                            <TouchableOpacity
                                            onPress={__takePicture}
                                            style={{
                                            width: 70,
                                            height: 70,
                                            bottom: 0,
                                            borderRadius: 50,
                                            borderColor: '#a1cda8',
                                            borderWidth: 5,
                                            backgroundColor: '#fff'
                                            }}
                                            />
                                    </View>
                                </View>
                            </View>
                        </Camera>
                    )}
                </View>
            ) : (
                <View
                    style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center'
                    }}
                >
                    <TouchableOpacity
                        onPress={__startCamera}
                        style={{
                            width: 130,
                            borderRadius: 4,
                            backgroundColor: '#14274e',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 40
                        }}
                    >
                        <Text
                            style={{
                            color: '#fff',
                            fontWeight: 'bold',
                            textAlign: 'center'
                            }}
                        >
                            Open camera
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <StatusBar style="auto" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        width: '100%'
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'column',
        margin: Platform.OS === 'ios' ? 40 : 15,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
});

export default MyCamera
