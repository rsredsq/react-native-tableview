import React from 'react'
import PropTypes from 'prop-types'
import {
  NativeModules,
  requireNativeComponent,
  EdgeInsetsPropType,
  PointPropType,
  findNodeHandle,
  View,
} from 'react-native'
import TableViewSection from './TableViewSection'
import TableViewCell from './TableViewCell'
import TableViewItem from './TableViewItem'
import RNTableViewConsts from './TableViewConsts'
import ViewPropTypes from './util/ViewPropTypes'

const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource')

const RNTableView = requireNativeComponent('RNTableView', null)

function extend(el, map) {
  for (const i in map) {
    if (typeof map[i] !== 'object') el[i] = map[i]
  }

  return el
}

const FontWeight = PropTypes.oneOf([100, 200, 300, 400, 500, 600, 700, 800, 900, 'bold', 'normal'])
const FontStyle = PropTypes.oneOf(['italic', 'normal', 'oblique'])

class TableView extends React.Component {
  static propTypes = {
    onPress: PropTypes.func,
    onAccessoryPress: PropTypes.func,
    onWillDisplayCell: PropTypes.func,
    onEndDisplayingCell: PropTypes.func,
    selectedValue: PropTypes.oneOf([PropTypes.string, PropTypes.number]), // string or integer basically
    autoFocus: PropTypes.bool,
    autoFocusAnimate: PropTypes.bool,
    alwaysBounceVertical: PropTypes.bool,
    moveWithinSectionOnly: PropTypes.bool,
    json: PropTypes.string,
    tintColor: PropTypes.string,
    fontSize: PropTypes.number,
    fontWeight: FontWeight,
    fontStyle: FontStyle,
    fontFamily: PropTypes.string,
    textColor: PropTypes.string,
    detailTextColor: PropTypes.string,
    detailFontSize: PropTypes.number,
    detailFontWeight: FontWeight,
    detailFontStyle: FontStyle,
    detailFontFamily: PropTypes.string,
    headerTextColor: PropTypes.string,
    headerFontSize: PropTypes.number,
    headerFontWeight: FontWeight,
    headerFontStyle: FontStyle,
    headerFontFamily: PropTypes.string,
    footerTextColor: PropTypes.string,
    footerFontSize: PropTypes.number,
    footerFontWeight: FontWeight,
    footerFontStyle: FontStyle,
    footerFontFamily: PropTypes.string,
    separatorColor: PropTypes.string,
    separatorStyle: PropTypes.number,
    scrollEnabled: PropTypes.bool,
    sectionIndexTitlesEnabled: PropTypes.bool,
    showsHorizontalScrollIndicator: PropTypes.bool,
    showsVerticalScrollIndicator: PropTypes.bool,
    onScroll: PropTypes.func,
    onChange: PropTypes.func,
    /**
     * The amount by which the content is inset from the edges
     * of the TableView. Defaults to `{0, 0, 0, 0}`.
     * @platform ios
     */
    contentInset: EdgeInsetsPropType,
    /**
     * Used to manually set the starting scroll offset.
     * The default value is `{x: 0, y: 0}`.
     * @platform ios
     */
    contentOffset: PointPropType,
    /**
     * The amount by which the scroll view indicators are inset from the
     * edges of the TableView. This should normally be set to the same
     * value as the `contentInset`. Defaults to `contentInset` or
     * `{0, 0, 0, 0}`.
     * @platform ios
     */
    scrollIndicatorInsets: EdgeInsetsPropType,
    tableViewStyle: PropTypes.number,
    tableViewCellStyle: PropTypes.number,
    tableViewCellEditingStyle: PropTypes.number,
    style: ViewPropTypes.style,
  }

  static defaultProps = {
    tableViewStyle: RNTableViewConsts.Style.Plain,
    tableViewCellStyle: RNTableViewConsts.CellStyle.Subtitle,
    tableViewCellEditingStyle: RNTableViewConsts.CellEditingStyle.Delete,
    separatorStyle: RNTableViewConsts.SeparatorStyle.Line,
    autoFocusAnimate: true,
    autoFocus: false,
    alwaysBounceVertical: true,
    scrollEnabled: true,
    sectionIndexTitlesEnabled: false,
    showsHorizontalScrollIndicator: true,
    showsVerticalScrollIndicator: true,
    moveWithinSectionOnly: false,
    style: null,
    json: null,
    selectedValue: null,
    contentInset: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    contentOffset: {
      x: 0,
      y: 0,
    },
    scrollIndicatorInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    textColor: null,
    detailTextColor: null,
    tintColor: null,
    headerTextColor: null,
    footerTextColor: null,
    separatorColor: null,
    fontSize: null,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: null,
    detailFontSize: null,
    detailFontWeight: 'normal',
    detailFontStyle: 'normal',
    detailFontFamily: null,
    headerFontSize: null,
    headerFontWeight: 'normal',
    headerFontStyle: 'normal',
    headerFontFamily: null,
    footerFontSize: null,
    footerFontWeight: 'normal',
    footerFontStyle: 'normal',
    footerFontFamily: null,
    onChange: () => null,
    onScroll: () => null,
    onPress: () => null,
    onAccessoryPress: () => null,
    onWillDisplayCell: () => null,
    onEndDisplayingCell: () => null,
  }

  constructor(props) {
    super(props)

    this.state = this._stateFromProps(props)
  }

  componentWillReceiveProps(nextProps) {
    const state = this._stateFromProps(nextProps)
    this.setState(state)
  }

  // Translate TableView prop and children into stuff that RNTableView understands.
  _stateFromProps(props) {
    const sections = []
    const additionalItems = []
    const children = []
    const { json } = props

    // iterate over sections
    React.Children.forEach(props.children, (section, index) => {
      const items = []
      let count = 0

      if (section && section.type === TableViewSection) {
        let customCells = false

        React.Children.forEach(section.props.children, (child, itemIndex) => {
          const el = {}
          extend(el, section.props)
          extend(el, child.props)

          if (el.children) {
            el.label = el.children
          }

          if (el.image && typeof el.image === 'number') {
            el.image = resolveAssetSource(el.image)
          }

          count++
          items.push(el)

          if (child.type === TableViewCell) {
            customCells = true
            count++

            const element = React.cloneElement(child, {
              key: `${index} ${itemIndex}`,
              section: index,
              row: itemIndex,
            })
            children.push(element)
          }
        })

        sections.push({
          customCells,
          label: section.props.label,
          footerLabel: section.props.footerLabel,
          footerHeight: section.props.footerHeight,
          headerHeight: section.props.headerHeight,
          items,
          count,
        })
      } else if (section && section.type === TableViewItem) {
        const el = extend({}, section.props)

        if (!el.label) {
          el.label = el.children
        }

        additionalItems.push(el)
      } else if (section) {
        children.push(section)
      }
    })

    this.sections = sections

    return {
      sections,
      additionalItems,
      children,
      json,
    }
  }

  scrollTo(x, y, animated) {
    NativeModules.RNTableViewManager.scrollTo(findNodeHandle(this.tableView), x, y, animated)
  }

  _onScroll(event) {
    this.props.onScroll(event)
  }

  _onPress(event) {
    const data = event.nativeEvent

    if (
      this.sections[data.selectedSection] &&
      this.sections[data.selectedSection].items[data.selectedIndex] &&
      this.sections[data.selectedSection] &&
      this.sections[data.selectedSection].items[data.selectedIndex].onPress
    ) {
      this.sections[data.selectedSection] && this.sections[data.selectedSection].items[data.selectedIndex].onPress(data)
    }

    this.props.onPress(data)
    event.stopPropagation()
  }

  _onAccessoryPress(event) {
    const data = event.nativeEvent

    this.props.onAccessoryPress(data)

    if (this.sections) {
      const pressedItem = this.sections[data.accessorySection].items[data.accessoryIndex]

      pressedItem.onAccessoryPress && pressedItem.onAccessoryPress(data)
    }

    event.stopPropagation()
  }

  _onChange(event) {
    const data = event.nativeEvent

    if (
      this.sections[data.selectedSection] &&
      this.sections[data.selectedSection].items[data.selectedIndex] &&
      this.sections[data.selectedSection] &&
      this.sections[data.selectedSection].items[data.selectedIndex].onChange
    ) {
      this.sections[data.selectedSection] &&
        this.sections[data.selectedSection].items[data.selectedIndex].onChange(data)
    }

    this.props.onChange(data)
    event.stopPropagation()
  }

  _onWillDisplayCell(event) {
    const data = event.nativeEvent

    if (
      this.sections[data.section] &&
      this.sections[data.section].items[data.row] &&
      this.sections[data.section].items[data.row].onWillDisplayCell
    ) {
      this.sections[data.section].items[data.row].onWillDisplayCell(data)
    }

    this.props.onWillDisplayCell(data)
    event.stopPropagation()
  }

  _onEndDisplayingCell(event) {
    const data = event.nativeEvent

    if (
      this.sections[data.section] &&
      this.sections[data.section].items[data.row] &&
      this.sections[data.section].items[data.row].onEndDisplayingCell
    ) {
      this.sections[data.section].items[data.row].onEndDisplayingCell(data)
    }

    this.props.onEndDisplayingCell(data)
    event.stopPropagation()
  }

  render() {
    return (
      <View style={[{ flex: 1 }, this.props.style]}>
        <RNTableView
          ref={(ref) => {
            this.tableView = ref
          }}
          style={this.props.style}
          sections={this.state.sections}
          additionalItems={this.state.additionalItems}
          tableViewStyle={this.props.tableViewStyle}
          tableViewCellStyle={this.props.tableViewCellStyle}
          tableViewCellEditingStyle={this.props.tableViewCellEditingStyle}
          separatorStyle={this.props.separatorStyle}
          scrollIndicatorInsets={this.props.contentInset}
          alwaysBounceVertical={this.props.alwaysBounceVertical}
          {...this.props}
          json={this.state.json}
          onScroll={(...args) => this._onScroll(...args)}
          onPress={(...args) => this._onPress(...args)}
          onAccessoryPress={(...args) => this._onAccessoryPress(...args)}
          onChange={(...args) => this._onChange(...args)}
          onWillDisplayCell={(...args) => this._onWillDisplayCell(...args)}
          onEndDisplayingCell={(...args) => this._onEndDisplayingCell(...args)}
        >
          {this.state.children}
        </RNTableView>
      </View>
    )
  }
}

export default TableView
