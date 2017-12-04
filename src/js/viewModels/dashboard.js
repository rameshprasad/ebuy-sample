/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'models/apiServices', 'moment', 'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojarraydataprovider'],
    function (oj, ko, $, apiServices, moment) {

        function DashboardViewModel() {
            var self = this;
            self.salesDataArray = ko.observableArray([]);
            self.filter = ko.observable();
            self.highlightChars = [];
            self.dataprovider = new ko.observable();


            // Below are a subset of the ViewModel methods invoked by the ojModule binding
            // Please reference the ojModule jsDoc for additional available methods.

            /**
             * Optional ViewModel method invoked when this ViewModel is about to be
             * used for the View transition.  The application can put data fetch logic
             * here that can return a Promise which will delay the handleAttached function
             * call below until the Promise is resolved.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @return {Promise|undefined} - If the callback returns a Promise, the next phase (attaching DOM) will be delayed until
             * the promise is resolved
             */
            self.handleActivated = function (info) {
                self.getSalesData();
            };

            /**
             * Optional ViewModel method invoked after the View is inserted into the
             * document DOM.  The application can put logic that requires the DOM being
             * attached here.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
             */
            self.handleAttached = function (info) {
                // Implement if needed
            };


            /**
             * Optional ViewModel method invoked after the bindings are applied on this View. 
             * If the current View is retrieved from cache, the bindings will not be re-applied
             * and this callback will not be invoked.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             */
            self.handleBindingsApplied = function (info) {
                // Implement if needed
            };

            /*
             * Optional ViewModel method invoked after the View is removed from the
             * document DOM.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
             */
            self.handleDetached = function (info) {
                // Implement if needed
            };

            self.getSalesData = function () {
                var dsPromise = apiServices.execute('sales', 'get-all-sales', 'get', null);
                dsPromise.then(function (response) {
                    if (response && response.data) {
                        var responseDataArray = response.data;

                        for (var i = 0; i < responseDataArray.length; i++) {
                            responseDataArray[i].date_time = moment(responseDataArray[i].date_time).format('MM/DD/YYYY h:mm a');
                        }

                        self.salesDataArray([]);
                        var unwrapArray = self.salesDataArray();
                        unwrapArray.push.apply(unwrapArray, responseDataArray);
                        self.salesDataArray.valueHasMutated();

                        self.dataprovider(new oj.ArrayDataProvider(responseDataArray, { idAttribute: 'id' }));
                    }
                });
            };

            self.handleKeyUp = function () {
                self.highlightChars = [];
                var filter = document.getElementById('filter').rawValue;
                if (filter.length == 0) {
                    self.clearClick();
                    return;
                }
                var dataArray = [];
                var i, id;
                for (i = self.salesDataArray().length - 1; i >= 0; i--) {
                    id = self.salesDataArray()[i].id;
                    Object.keys(self.salesDataArray()[i]).forEach(function (field) {
                        if (self.salesDataArray()[i][field].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                            self.highlightChars[id] = self.highlightChars[id] || {};
                            self.highlightChars[id][field] = getHighlightCharIndexes(filter, self.salesDataArray()[i][field]);
                            if (dataArray.indexOf(self.salesDataArray()[i]) < 0) {
                                dataArray.push(self.salesDataArray()[i]);
                            }
                        }
                    });
                }
                dataArray.reverse();
                self.dataprovider(new oj.ArrayDataProvider(dataArray, { idAttribute: 'id' }));

                function getHighlightCharIndexes(highlightChars, text) {
                    var highlightCharStartIndex = text.toString().toLowerCase().indexOf(highlightChars.toString().toLowerCase());
                    return { startIndex: highlightCharStartIndex, length: highlightChars.length };
                };
            };

            self.clearClick = function (data, event) {
                self.filter('');
                self.dataprovider(new oj.ArrayDataProvider(self.salesDataArray(), { idAttribute: 'id' }));
                self.highlightChars = [];
                return true;
            }

            self.highlightingCellRenderer = function (context) {
                var id = context.row.id;
                var startIndex = null;
                var length = null;
                var field = null;
                if (context.columnIndex === 0) {
                    field = 'id';
                }
                else if (context.columnIndex === 1) {
                    field = 'txnt_id';
                }
                else if (context.columnIndex === 2) {
                    field = 'username';
                }
                else if (context.columnIndex === 3) {
                    field = 'product_zone';
                }
                else if (context.columnIndex === 4) {
                    field = 'product';
                }
                else if (context.columnIndex === 5) {
                    field = 'brand';
                }
                else if (context.columnIndex === 6) {
                    field = 'model';
                }
                else if (context.columnIndex === 7) {
                    field = 'date_time';
                }
                else if (context.columnIndex === 8) {
                    field = 'quantity';
                }
                else if (context.columnIndex === 9) {
                    field = 'amount';
                }
                var data = context.row[field].toString();
                if (self.highlightChars[id] != null &&
                    self.highlightChars[id][field] != null) {
                    startIndex = self.highlightChars[id][field].startIndex;
                    length = self.highlightChars[id][field].length;
                }
                if (startIndex != null &&
                    length != null) {
                    var highlightedSegment = data.substr(startIndex, length);
                    data = data.substr(0, startIndex) + '<b>' + highlightedSegment + '</b>' + data.substr(startIndex + length, data.length - 1);
                }
                $(context.cellContext.parentElement).append(data);
            };

            self.columnArray = [{
                headerText: 'Id',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Txn Id',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'User Name',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Product Zone',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Product',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Brand',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Model',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Date Time',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Quantity',
                renderer: self.highlightingCellRenderer
            },
            {
                headerText: 'Amount',
                renderer: self.highlightingCellRenderer
            }];

        }

        /*
         * Returns a constructor for the ViewModel so that the ViewModel is constructed
         * each time the view is displayed.  Return an instance of the ViewModel if
         * only one instance of the ViewModel is needed.
         */
        return new DashboardViewModel();
    }
);
