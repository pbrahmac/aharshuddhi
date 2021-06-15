import React, { useState } from 'react'
import { View } from 'react-native'
import { RNCamera } from "react-native-camera";

const MyNewCamera = () => {
    const [canDetectText, setCanDetectText] = useState(true)
    const [textBlocks, setTextBlocks] = useState([])

    const renderCamera = () => {
        const textRecognized = (object) => {
            const { textBlocks } = object
            setTextBlocks(textBlocks)
        }
    
        const renderTextBlocks = () => {
            return (
                <View style={{ flex: 1 }} pointerEvents="none">
                    {
                        textBlocks.map(renderTextBlock)
                    }
                </View>
            )
        }
    
        return (
            <RNCamera
                ref={(ref) => { camera = ref }}
                style={{ flex: 1 }}
                trackingEnabled
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera.',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel'
                }}
                onTextRecognized={canDetectText ? textRecognized : null}
            >
                {!!canDetectText && renderTextBlocks()}
            </RNCamera>
            
        )
    }

    return (
        <View style={{ flex: 1, width: '100%' }}>
            {renderCamera()}
        </View>
    )
}

export default MyNewCamera
