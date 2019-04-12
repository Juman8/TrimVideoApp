import React, { Component } from 'react';
import { View, Dimensions, Button, Platform, ActivityIndicator, CameraRoll, Text } from 'react-native';
import { VideoPlayer, Trimmer } from 'react-native-video-processing';
const {height, width} = Dimensions.get('window') 
import { ImageCacheManager } from 'react-native-cached-image'

export default class App extends React.PureComponent {
    constructor(props){
        super(props)
        this.state={
            cachedVideoURI: '/data/user/0/com.trimvideo123456/cache/imagesCacheDir/192_168_0_5_3008_4e3a39273d0c3594c7604e0712625e5d2b7d73f4/f492fbd7ced106b9ace740108160ab838f981e83.mp4',
            load: false,
            startTime: 0,
            lastTime: 15,
            totalTime: 15,
            isLoad: false,
        }
    }
    async componentDidMount(){
       await this.CacheVideo()
       await this.getVideoInfo()
    }

    trimVideo() {
        const {startTime, lastTime} = this.state
        this.setState({load: true})
        const time = lastTime-startTime
        if(time > 15 || time< 5){
            alert('Try again')
            return
        }
        const options = {
            startTime: startTime,
            endTime: lastTime,
            // quality: VideoPlayer.Constants.quality.QUALITY_1280x720, // iOS only
            // saveToCameraRoll: true, // default is false // iOS only
            // saveWithCurrentDate: true, // default is false // iOS only
        };
        if(Platform.OS === 'ios'){
            options.quality = VideoPlayer.Constants.quality.QUALITY_1280x720, // iOS only
            // options.saveToCameraRoll = true, // default is false // iOS only
            options.saveWithCurrentDate = true // default is false // iOS only
        }
        this.videoPlayerRef.trim(options)
            .then((newSource) => {
                CameraRoll.saveToCameraRoll(newSource)
                .then(()=>
                    this.setState({load: false})
                )
            }).catch(()=>{
                this.setState({load: false})
            });
    }
 
    compressVideo() {
        const options = {
            width: 720,
            height: 1280,
            bitrateMultiplier: 3,
            saveToCameraRoll: true, // default is false, iOS only
            saveWithCurrentDate: true, // default is false, iOS only
            minimumBitrate: 300000,
            removeAudio: true, // default is false
        };
        this.videoPlayerRef.compress(options)
            .then((newSource) => console.log(newSource))
            .catch(console.warn);
    }

    CacheVideo = async (uri = 'http://192.168.0.5:3008/system/images/files/000/000/032/original/1554438485351.mp4?1554438498') => {
        console.log('uri', uri)
        ImageCacheManager({})
          .downloadAndCacheUrl(uri)
          .then(res => {
            //   console.log(res)
            this.setState({ cachedVideoURI: res })
          })
          .catch((err) => {
            console.log('cacacac', err)
            // this.setState({})
          })
      }
 
    getPreviewImageForSecond(second) {
        const maximumSize = { width: 640, height: 1024 }; // default is { width: 1080, height: 1080 } iOS only
        this.videoPlayerRef.getPreviewForSecond(second, maximumSize) // maximumSize is iOS only
        .then((base64String) => console.log('This is BASE64 of image', base64String))
        .catch(console.warn);
    }
 
    getVideoInfo() {
        this.videoPlayerRef.getVideoInfo()
        .then((info) => {
            console.log(info.duration)
            this.setState({lastTime: info.duration|| 0, totalTime: info.duration, isLoad: true})
        })
        .catch(console.warn);
    }
 
    render() {
        const {cachedVideoURI, lastTime, load, startTime, totalTime, isLoad } = this.state
        console.log(startTime)
        return (
            <View style={{ height, width, backgroundColor: 'gray' }}>
                <VideoPlayer
                    ref={ref => this.videoPlayerRef = ref}
                    startTime={startTime|| 0}  // seconds
                    endTime={isLoad? lastTime>totalTime? totalTime: lastTime : 0}   // seconds
                    play={true}     // default false
                    replay={true}   // should player play video again if it's ended
                    rotate={true}   // use this prop to rotate video if it captured in landscape mode iOS only
                    source={cachedVideoURI}
                    playerWidth={width} // iOS only
                    playerHeight={height} // iOS only
                    style={{ width, height: height - 50 }}
                    resizeMode={VideoPlayer.Constants.resizeMode.CONTAIN}
                    // onChange={({ nativeEvent }) => console.log({ nativeEvent })} // get Current time on every second
                />
               
                <View style={{ height: 50, position: 'absolute', bottom: 50}}>
                <Trimmer
                    source={cachedVideoURI}
                    // height={height}
                    // width={width/2}
                    onTrackerMove={(e) => console.log(e.currentTime)} // iOS only
                    currentTime={0} // use this prop to set tracker position iOS only
                    // themeColor={'white'} // iOS only
                    // thumbWidth={30} // iOS only
                    // trackerColor={'green'} // iOS only
                    onChange={(startTime, lastTime) => {
                        this.setState({
                            startTime,
                            lastTime,
                        })
                    }}
                />
                {/* <View style={{width, backgroundColor: 'green', justifyContent: 'space-between', flexDirection: 'row'}}>
                <Text>{startTime.toFixed()}</Text>
                <Text>{lastTime.toFixed()}</Text>
                </View> */}
                
                </View>
                <View style={{marginTop: 50}}>
                {load?
                <ActivityIndicator size="small" color="blue" />
                :
                <Button
                    title="Save"
                    onPress={()=> this.trimVideo()}
                    color="green"
                />
            }
                </View>
                
            </View>
        );
    }
}