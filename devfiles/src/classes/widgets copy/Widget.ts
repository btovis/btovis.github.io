import Data from '../data/Data.js'
import WidgetConfig from './WidgetConfig.js'

export default class Widget {
    protected data: Data;
    protected config: WidgetConfig;

    public constructor(data: Data, config: WidgetConfig) {
      this.data = data;
      this.config = config;
    }
}