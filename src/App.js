import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  StatusBar,
  View,
  ScrollView,
  Text,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native';

import resolveAssetSource from 'resolveAssetSource';

import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const images = [
  {
    url: require('./assets/1.jpg')
  },
  {
    url: require('./assets/2.jpg')
  },
  {
    url: require('./assets/3.jpeg')
  },
  {
    url: require('./assets/4.jpg')
  },
  {
    url: require('./assets/5.jpg')
  },
  {
    url: require('./assets/6.jpg')
  }
]


class MainScreen extends Component {
  constructor(props){
    super(props)

    this.widthOffsetRation = 2.4;

    this.state = {
      isSideMenuOpen: false,
      isYearSelected: false,
      isIconClicked: false,
      showImageMenu: false,
      yearLabels: ['2012', '2013', '2014', '2015', '2016', '2017'],
      scrollValue: new Animated.Value(0),
      viewWidth: Dimensions.get('window').width,
      viewHeight: Dimensions.get('window').height,
      imageWidth: Dimensions.get('window').width / this.widthOffsetRation,
      y: 0
    };

    // Bind functions
    this.getImgHeight = this.getImgHeight.bind(this);
    this.moveYearTop = this.moveYearTop.bind(this);
    this.openImageMenu = this.openImageMenu.bind(this);

    this.animatedMarginBottomValue = new Animated.Value(300);

    this.animatedMarginLeft = [];
    this.animatedGridPositions = [];
    this.animatedImageHeights = [];
    this.animatedImageWidths = [];

    // Initial positions of the images
    this.initialXPositions = [this.state.viewWidth/2, -100, 0, 0, 0, this.state.viewWidth];
    this.initialYPositions = [this.state.viewWidth/2, -100, -100, this.state.viewHeight, this.state.viewHeight, this.state.viewHeight];

    let gridYPositions = [];

    let imagesCount = images.length;

    // Animated values for the initial grid positioning
    this.gridAnimations = [];

    for(let i = 0; i < imagesCount; i++){
      this.animatedMarginLeft.push(new Animated.Value(0));
      this.animatedGridPositions.push(new Animated.ValueXY({x: this.initialXPositions[i], y: this.initialYPositions[i]}));
      this.animatedImageHeights.push(new Animated.Value(this.getImgHeight(images[i].url, this.state.viewWidth / 2.4)));
      this.animatedImageWidths.push(new Animated.Value(this.state.imageWidth));

      // Calculate Y position of each picture on the grid. Each position depends on the size of the picture above
      if(i == 0 || i == 1){
        gridYPositions[i] = 0;
        gridYPositions[i + 2] = gridYPositions[i] + this.getImgHeight(images[i].url, this.state.imageWidth) + 50;
      }
      else if (i != imagesCount - 1 && i != imagesCount - 2){
        gridYPositions[i + 2] =  gridYPositions[i] + this.getImgHeight(images[i].url, this.state.imageWidth) + 50;
      }

      this.gridAnimations.push(
        Animated.parallel([
          Animated.spring(this.animatedMarginLeft[i], {
            toValue: 0
          }),
          Animated.timing( this.animatedGridPositions[i],{
            // We subtract 0.2 from widthOffsetRation in order to have a little bit of space between adjusted pictures
            toValue: {x: i % 2 ? this.state.viewWidth / (this.widthOffsetRation - 0.2) : 0, y: gridYPositions[i]},
            duration: 600
          }),
          Animated.spring(this.animatedImageHeights[i], {
            toValue: this.getImgHeight(images[i].url, this.state.viewWidth / 2.4)
          }),
          Animated.spring(this.animatedImageWidths[i], {
            toValue: this.state.viewWidth / this.widthOffsetRation
          })
        ])
      );
    }

    // Animated values for the scroll positioning
    this.scrollAnimations = [];
    this.scrollYOffsets = [0];

    for(let i = imagesCount - 1, offsetIndex = 0; i >= 0; i--, offsetIndex++){
      this.scrollAnimations.push(
        Animated.parallel([
          Animated.timing( this.animatedGridPositions[i], {
            toValue: {x: 0, y: this.scrollYOffsets[offsetIndex]},
            duration: 400
          }),
          Animated.spring(this.animatedImageHeights[i], {
            toValue: this.getImgHeight(images[i].url, this.state.viewWidth / 1.5)
          }),
          Animated.spring(this.animatedImageWidths[i], {
            toValue: this.state.viewWidth / 1.5
          })
        ])
      );

      this.scrollYOffsets.push(this.scrollYOffsets[offsetIndex] + this.getImgHeight(images[i].url, this.state.viewWidth / 1.5) + 10);
    };
  }


  componentDidMount(){
    this.animateImages();
  }

  animateImages () {
    Animated.parallel(this.gridAnimations).start();
  }

  animateImagesToScroll () {
    Animated.parallel(this.scrollAnimations).start();
  }

  getImgHeight(img, imageWidth) {
    let source = resolveAssetSource(img);
    const screenWidth = this.state.viewWidth;
    const scaleFactor = (source.width / imageWidth);
    const imageHeight = source.height / scaleFactor;

    return imageHeight;
  }

  clickSideMenu(){
    this.setState({isSideMenuOpen: !this.state.isSideMenuOpen}, () => {
      if(!this.state.isSideMenuOpen){
        this.setState({showImageMenu: false});
        this.animateImages()

        this.setState({
          yearLabels: ['2012', '2013', '2014', '2015', '2016', '2017'],
          isYearSelected: false,
          imageWidth: this.state.viewWidth / this.state.widthOffsetRation});

          this.animatedMarginBottomValue.setValue(300);
        }
      });

      // Open side menu animation
      Animated.spring(this.state.scrollValue, { toValue: this.state.isSideMenuOpen ? 0 : 1 }).start();
    }

    moveYearTop(year){
      this.setState({isYearSelected: true, yearLabels: [ year ]}, () => {
        this.setState({imageWidth: this.state.viewWidth / 1.5}, () => this.animateImagesToScroll());

        Animated.timing(this.animatedMarginBottomValue, {
          toValue: 10,
          duration: 500
        }).start();
      });
    }

    openImageMenu(index){
      Animated.parallel([
        Animated.spring(this.animatedMarginLeft[index], {
          toValue: 80
        }),
        Animated.spring(this.animatedImageHeights[index], {
          toValue: this.getImgHeight(images[index].url, this.state.viewWidth / 3)
        }),
        Animated.spring(this.animatedImageWidths[index], {
          toValue: this.state.viewWidth / 3
        })
      ]).start();

      this.setState({showImageMenu: true});
    }

    clickIcon(){
      this.setState({isIconClicked: !this.state.isIconClicked});
    }

    render(){
      const monthLabels = ['JAN', 'FED', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

      const translateX = this.state.scrollValue.interpolate({
        inputRange: [0, 1], outputRange: [100, 10]
      });

      let yearViewRadius = ( this.state.viewHeight / 1.5) / 6;

      const yearsContainerStyle = {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 2,
        backgroundColor: 'white',
        opacity: 1
      };
      const activeYearLabelContainerStyle = {
        borderColor: '#88ddcc',
        borderRadius: 50,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center'
      };

      const yearLabelContainerStyle = {
        justifyContent: 'center',
        alignItems: 'center'
      };

      return(
        <View style={{ flex: 1, overflow: 'hidden', flexDirection: 'row' }}>
          <StatusBar backgroundColor='white'/>

          <View style={styles.mainContentStyle}>
            <View style={{justifyContent: 'center'}}>
              <Text style={styles.titleStyle}>Mood Board</Text>
            </View>

            <ScrollView contentContainerStyle={{height: this.state.viewHeight * images.length}} style={{marginLeft: 30, marginTop: 30}}>
              {images.map( (image,index) => {
                return (
                  <Animated.View key={index} style={{
                    position: 'absolute',
                    width: this.state.imageWidth,
                    height: this.getImgHeight(images[index].url, this.state.viewWidth / 1.5),
                    transform: this.animatedGridPositions[index].getTranslateTransform()
                  }}>
                  <TouchableHighlight onPress={ () => this.openImageMenu(index) }>
                    <Animated.Image source= {image.url} style={{ marginLeft: this.animatedMarginLeft[index], width: this.animatedImageWidths[index], height: this.animatedImageHeights[index] }}/>
                  </TouchableHighlight>

                  {this.state.showImageMenu && (
                    <View style={{flex: 1, justifyContent: 'center'}}>
                      <View style={{flex: 1, marginTop: 10, flexDirection: 'row', justifyContent: 'space-around'}}>
                          <MaterialIcon name='gmail' size={30} color='black'/>
                          <MaterialIcon name='whatsapp' size={30} color='black'/>
                          <TouchableHighlight onPress={ () => this.clickIcon() }>
                            {this.state.isIconClicked ?
                               <MaterialIcon name='check' size={30} color='black'/>
                               :
                               <MaterialIcon name='instagram' size={30} color='black'/>
                             }
                          </TouchableHighlight>
                      </View>
                      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', borderTopWidth: 0.7, borderTopColor: 'black'}}>
                        <Icon name='ios-print-outline' size={25} color='grey' style={{marginLeft:15, marginRight:15, marginTop: 10}}/>
                        <Icon name='ios-trash-outline' size={25} color='grey' style={{marginLeft:15, marginRight:15, marginTop: 10}}/>
                        <Icon name='ios-heart-outline' size={25} color='grey' style={{marginLeft:15, marginRight:15, marginTop: 10}}/>
                      </View>
                    </View>
                  )}
                </Animated.View>
              )
            })}
          </ScrollView>

        </View>

        <Animated.View style={ [styles.sideMenuStyle, { transform: [ {  translateX: translateX  }] }] }>
          <View style ={styles.toggleContainerStyle}>
            <TouchableHighlight style={styles.toggleButtonStyle} onPress={ this.clickSideMenu.bind(this) }>
              <Icon name={this.state.isSideMenuOpen ? 'ios-arrow-forward' : 'ios-arrow-back'} size={30} color='white'/>
            </TouchableHighlight>
          </View>

          <View style={yearsContainerStyle}>
            {this.state.yearLabels.map( (year, index) => {
              return (
                <Animated.View
                  key={index}
                  style={[{
                    marginRight: 10,
                    height: yearViewRadius,
                    width: yearViewRadius
                  }, index == 0 ? activeYearLabelContainerStyle : styles.yearLabelContainerStyle,
                  this.state.isYearSelected ? {marginTop: this.animatedMarginBottomValue} : null]}>
                  <TouchableOpacity onPress={ () => this.moveYearTop(year)}>
                    <Text style={styles.yearlabelStyle}>{year}</Text>
                  </TouchableOpacity>
                </Animated.View>
              )
            })}

            {
              this.state.isYearSelected &&
              (
                <Animated.View style={{  flex: 1, justifyContent: 'space-between', marginBottom: 20, marginRight: 10, marginTop: this.animatedMarginBottomValue}}>
                  {monthLabels.map( (month, index) => {
                    return (
                      <View key={index}>
                        <Text style={styles.monthlabelStyle}>{month}</Text>
                      </View>
                    )
                  })}
                </Animated.View>
              )
            }
          </View>
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainContentStyle: {
    flex: 6,
    backgroundColor: 'white'
  },
  titleStyle: {
    marginLeft: 20,
    fontSize: 30,
    fontFamily: 'sans-serif-thin',
    color: 'black'
  },
  sideMenuStyle: {
    flexDirection: 'row',
    width: 150,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0
  },
  toggleContainerStyle: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  toggleButtonStyle: {
    height: 60,
    width: 30,
    backgroundColor: '#88ddcc',
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  yearlabelStyle: {
    fontSize: 20,
    fontFamily: 'sans-serif-light',
    color: 'black'
  },
  monthlabelStyle: {
    fontSize: 15,
    fontFamily: 'sans-serif-light',
    color: 'black'
  },
  yearLabelContainerStyle:{
    justifyContent: 'center',
    alignItems: 'center'
  }
})

AppRegistry.registerComponent('TimeTravelInteraction', () => MainScreen);
