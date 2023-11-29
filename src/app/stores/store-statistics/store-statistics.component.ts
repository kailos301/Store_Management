import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { MatSelect } from '@angular/material/select';
import { Observable, Subject } from 'rxjs/index';
import { getOrderItemsStatisticsList, getSelectedStore, getSelectedStoreLocale } from '../+state/stores.selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { StoreStatistics, ClientStore } from '../stores';
import { getStoreStatistics } from '../+state/stores.selectors';
import { DownloadOrderItemsXls, LoadOrderItemsStatisticsPage, LoadStoreStatistics } from '../+state/stores.actions';
import { ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { TranslateService } from '@ngx-translate/core';
import { helpPage } from 'src/app/shared/help-page.const';
import { ActivatedRoute, Router } from '@angular/router';
import { Paging } from 'src/app/api/types/Pageable';
import { getCatalogOverview, getOfferDetails } from '../store-catalog/+state/stores-catalog.selectors';
import { CatalogState } from '../store-catalog/+state/stores-catalog.reducer';
import { StoreCatalog } from '../store-catalog/stores-catalog';



// https://stackblitz.com/angular/mgomajbnelr?file=src%2Fapp%2Fdatepicker-views-selection-example.ts
// https://www.positronx.io/angular-chart-js-tutorial-with-ng2-charts-examples/

@Component({
  selector: 'app-store-statistics',
  templateUrl: './store-statistics.component.html',
  styleUrls: ['./store-statistics.component.scss'],
})
export class StoreStatisticsComponent implements OnInit, OnDestroy {
  periodicTerm = 'MONTHLY';
  maxDate = moment();
  store$: Observable<ClientStore>;
  sortDir = 1;
  locale$: Observable<string>;
  orderItemsStatisticsList$: Observable<any>;
  statisticsTypes: string[] = ['orders', 'menu', 'orderValue'];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  fromDate = new FormControl(moment().subtract(6, 'months').toDate());
  toDate = new FormControl(moment().toDate());
  type = new FormControl(this.statisticsTypes[0]);
  catalogData: StoreCatalog;
  unsubscribe$: Subject<void> = new Subject<void>();
  storeId: number;
  orderStatus = '';
  statistics: StoreStatistics[];
  total = 0;
  page: number;
  size: number;
  catalogId: any;
  totalSubmitted = 0;
  totalViewed = 0;
  activeBtn = 0;
  showOrderItem = false;
  statisticsTotal = {
    cancelCount: 0,
    closedCount: 0,
    draftCount: 0,
    receivedCount: 0,
    submitCount: 0,
    total: 0.0,
    totalPaid: 0.0,
    totalNonPaid: 0.0,
    totalSubmitted: 0,
    totalViewings: 0
  };

  lineChartData: ChartDataSets[] = [];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';
  lineChartLabels: Label[] = [];
  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      labels: {
        fontColor: '#23282c',
        fontSize: 14
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          fontSize: 14,
          min: 0,
          stepSize: 1,
          fontColor: '#23282c'
        }
      }],
      xAxes: [{
        ticks: {
          fontSize: 14,
          fontColor: '#23282c'
        }
      }]
    }
  };
  lineChartColors: Color[] = [
    { borderColor: '#48b9b7' },
    { borderColor: '#273773' },
    { borderColor: '#008100' },
    { borderColor: '#9833ff' }
  ];
  storeStatisticsHelpPage = helpPage.statistics;
  isSortingForAll: string;
  @ViewChild('periodicTermRef', { static: false }) periodicTermRef: MatSelect;
  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    private catalog: Store<CatalogState>,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.store$ = this.store.select(getSelectedStore);
    this.locale$ = this.store.select(getSelectedStoreLocale);
    const params = this.activeRoute.params as any;
    this.storeId = params._value.id;
    this.orderItemsStatisticsList$ = this.store.pipe(select(getOrderItemsStatisticsList));
    this.catalog.pipe(
      select(getCatalogOverview),
      takeUntil(this.unsubscribe$)
    ).subscribe(data => this.catalogData = data);
    this.store.select(getStoreStatistics)
      .pipe(takeUntil(this.unsubscribe$), filter(s => !!s))
      .subscribe((s) => {
        this.statistics = s;
        this.total = this.statistics.reduce((a, b) => +a + +b.total, 0);
        this.totalSubmitted = this.statistics.reduce((a, b) => +a + +b.totalSubmitted, 0);
        this.totalViewed = this.statistics.reduce((a, b) => +a + +b.totalViewings, 0);
        this.statisticsTotal.cancelCount = this.statistics.reduce((a, b) => +a + +b.cancelCount, 0);
        this.statisticsTotal.closedCount = this.statistics.reduce((a, b) => +a + +b.closedCount, 0);
        this.statisticsTotal.submitCount = this.statistics.reduce((a, b) => +a + +b.submitCount, 0);
        this.statisticsTotal.draftCount = this.statistics.reduce((a, b) => +a + +b.draftCount, 0);
        this.statisticsTotal.receivedCount = this.statistics.reduce((a, b) => +a + +b.receivedCount, 0);
        this.statisticsTotal.totalPaid = this.statistics.reduce((a, b) => +a + +b.totalPaid, 0);
        this.statisticsTotal.totalNonPaid = this.statistics.reduce((a, b) => +a + +b.totalNonPaid, 0);
        this.onTypeChange();
      });
  }

  createOrdersChart(data: StoreStatistics[]) {
    this.lineChartData.push(this.createChartDataObj(
      data.map(a => a.submitCount),
      this.translate.instant('admin.store.statistics.submitted')
    ));
    this.lineChartData.push(this.createChartDataObj(
      data.map(a => a.receivedCount),
      this.translate.instant('admin.store.statistics.received')
    ));
    this.lineChartData.push(this.createChartDataObj(
      data.map(a => a.closedCount),
      this.translate.instant('admin.store.closed')
    ));
    this.lineChartData.push(this.createChartDataObj(
      data.map(a => a.cancelCount),
      this.translate.instant('admin.store.cancelled')
    ));
  }
  paginate(paging: Paging) {
    const from = this.periodicTerm === 'MONTHLY'
                  ? moment(this.fromDate.value).startOf('month')
                  : moment(this.fromDate.value).startOf('day');
    const to = this.periodicTerm === 'MONTHLY'
                  ? moment(this.toDate.value).endOf('month')
                  : moment(this.toDate.value).endOf('day');
    this.store.dispatch(new LoadOrderItemsStatisticsPage(
      this.storeId, from.format('YYYY-MM-DDTHH:mm:ss[Z]'),
      to.format('YYYY-MM-DDTHH:mm:ss[Z]'),
      'ORDER_DATE',
      paging,
      this.orderStatus
        ? this.orderStatus + ',' + (this.isSortingForAll.includes('up') ? 'asc' : 'desc')
        : 'totalDiscountedPrice,desc'
    ));
  }

  onSortClick(event, colName) {
    const from = this.periodicTerm === 'MONTHLY'
                  ? moment(this.fromDate.value).startOf('month')
                  : moment(this.fromDate.value).startOf('day');
    const to = this.periodicTerm === 'MONTHLY'
                  ? moment(this.toDate.value).endOf('month')
                  : moment(this.toDate.value).endOf('day');

    const target = event.currentTarget;
    const classList = target.classList;

    if (classList.contains('fa-sort-down')) {
      this.orderStatus = colName;
      this.store.dispatch(new LoadOrderItemsStatisticsPage(this.storeId, from.format('YYYY-MM-DDTHH:mm:ss[Z]'),
        to.format('YYYY-MM-DDTHH:mm:ss[Z]'), 'ORDER_DATE', { page: 0, size: 10 }, colName + ',asc'));
      classList.remove('fa-sort-down');
      classList.remove('fa-sort');
      classList.add('fa-sort-up');
      this.isSortingForAll = classList.value;
      this.sortDir = -1;
    } else {
      this.orderStatus = colName;
      this.store.dispatch(new LoadOrderItemsStatisticsPage(this.storeId, from.format('YYYY-MM-DDTHH:mm:ss[Z]'),
        to.format('YYYY-MM-DDTHH:mm:ss[Z]'), 'ORDER_DATE', { page: 0, size: 10 }, colName + ',desc'));
      classList.remove('fa-sort');
      classList.remove('fa-sort-up');
      classList.add('fa-sort-down');
      this.isSortingForAll = classList.value;
      this.sortDir = 1;
    }
  }
  createMenuViewingChart(data: StoreStatistics[]) {
    this.lineChartData.push(this.createChartDataObj(data.map(a => a.totalViewings), this.translate.instant('admin.store.statistics.totalViewing')));
  }

  createOrderValueChart(data: StoreStatistics[]) {
    this.lineChartData.push(this.createChartDataObj(
      data.map(a => a.totalPaid),
      this.translate.instant('admin.store.statistics.totalPaid')
    ));
    this.lineChartData.push(this.createChartDataObj(
      data.map(a => a.totalNonPaid),
      this.translate.instant('admin.store.statistics.totalNonPaid')
    ));
  }

  createChartDataObj(data, label) {
    const chartData: ChartDataSets = { data: [], label: '' };
    chartData.data = data;
    chartData.label = label;
    return chartData;
  }

  @HostListener('window:scroll', ['$event'])
  scrollHandler(event) {
    this.periodicTermRef.close();
  }
  goToStoreOfferPage(store) {
    if (store.hierarchyLevel === 'PARENT') {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogData.catalogId}/offer/${store.offerId}`]);
    }
  }
  onTypeChange(type = null) {
    if (type) {
      this.type.setValue(type);
    } else {
      this.type.setValue(this.statisticsTypes[0]);
    }
    this.showOrderItem = false;
    this.lineChartData = [];
    if (this.periodicTerm === 'DAILY' && this.statistics.filter(a => !a.day).length === 0) {
        this.lineChartLabels = this.statistics.map(a => a.day.toString());
    }
    else {
      this.lineChartLabels = this.statistics.map(a => this.months[a.month - 1] + '-' + a.year);
    }
    if (this.type.value === this.statisticsTypes[0]) {
      this.createOrdersChart(this.statistics);
      this.activeBtn = 0;
    } else if (this.type.value === this.statisticsTypes[1]) {
      this.createMenuViewingChart(this.statistics);
      this.activeBtn = 1;
    } else if (this.type.value === this.statisticsTypes[2]) {
      this.createOrderValueChart(this.statistics);
      this.activeBtn = 2;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  chosenFromDayHandler(normalizedDay) {
    const selectedDate = new Date(`${normalizedDay._i.month + 1}/${normalizedDay._i.date}/${normalizedDay._i.year}`);
    this.fromDate.setValue(selectedDate);
    this.fromDayHandler(selectedDate);
  }

  chosenToDayHandler(normalizedDay) {
    const selectedDate = new Date(`${normalizedDay._i.month + 1}/${normalizedDay._i.date}/${normalizedDay._i.year}`);
    this.toDate.setValue(selectedDate);
    this.toDayHandler(selectedDate, false);
  }

  chosenFromMonthHandler(normalizedMonth) {
    const date = new Date(`${normalizedMonth._i.month + 1}/${normalizedMonth._i.date}/${normalizedMonth._i.year}`);
    this.fromDate.setValue(date);
    this.fromMonthHandler(date);
  }

  chosenToMonthHandler(normalizedMonth) {
    const date = new Date(`${normalizedMonth._i.month + 1}/${normalizedMonth._i.date}/${normalizedMonth._i.year}`);
    this.toDate.setValue(date);
    this.toMonthHandler(date);
  }

  formatDate(d) {
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  loadStoreStatistics(duration) {
    const from = this.periodicTerm === 'MONTHLY'
                  ? moment(this.fromDate.value).startOf('month')
                  : moment(this.fromDate.value).startOf('day');
    const to = this.periodicTerm === 'MONTHLY'
                  ? moment(this.toDate.value).endOf('month')
                  : moment(this.toDate.value).endOf('day');
    this.store.dispatch(new LoadStoreStatistics(
      duration, from.format('YYYY-MM-DD HH:mm:ss'),
      to.format('YYYY-MM-DD HH:mm:ss'),
      this.periodicTerm,
    ));
    this.store.dispatch(new LoadOrderItemsStatisticsPage(
      this.storeId,
      from.format('YYYY-MM-DDTHH:mm:ss[Z]'),
      to.format('YYYY-MM-DDTHH:mm:ss[Z]'),
      'ORDER_DATE',
      { page: 0, size: 10 },
      'totalDiscountedPrice,asc'
    ));
  }

  onOrderItemClick() {
    if (!this.showOrderItem) {
      this.showOrderItem = true;
    }
    this.activeBtn = null;
  }

  downloadXls(orderItemReportType: string) {
    const to = (
                this.periodicTerm === 'MONTHLY'
                  ? moment(this.toDate.value).endOf('month')
                  : moment(this.toDate.value).endOf('day')
               ).format('YYYY-MM-DD[T]HH:mm:ss.[0Z]');
    const from = (
                  this.periodicTerm === 'MONTHLY'
                    ? moment(this.fromDate.value).startOf('month')
                    : moment(this.fromDate.value).startOf('day')
                 ).format('YYYY-MM-DD[T]HH:mm:ss.[0Z]');
    this.store.dispatch(new DownloadOrderItemsXls(this.storeId, orderItemReportType, from, to));
  }

  fromDayHandler(selectedDate) {
    let duration;
    const dayDiff = moment(this.toDate.value).diff(selectedDate, 'day');
    if (moment(selectedDate).isSame(this.getMonthStartDate(selectedDate), 'day')) {
      const endDate = this.getMonthEndDate(selectedDate);
      this.toDate.setValue(endDate);
      duration = moment(this.toDate.value).diff(selectedDate, 'day') - 1;
    } else if (dayDiff != null && (dayDiff > 30 || dayDiff < 0)) {
      let toDate = selectedDate;
      toDate = (moment(selectedDate).add(30, 'day')).toDate();
      toDate = (toDate > moment().toDate()) ? moment().toDate() : toDate;
      this.toDate.setValue(toDate);
      duration = moment(this.toDate.value).diff(selectedDate, 'day');
    } else {
      duration = -1;
    }
    if (duration != null) {
      this.loadStoreStatistics(duration);
    }
  }

  toDayHandler(selectedDate, isPeriodChange) {
    let duration;
    const dayDiff = moment(selectedDate).diff(this.fromDate.value, 'day');
    if (moment(selectedDate).isSame(this.getMonthEndDate(selectedDate), 'day')) {
      const startDate = this.getMonthStartDate(selectedDate);
      this.fromDate.setValue(startDate);
      duration = moment(selectedDate).diff(this.fromDate.value, 'day') - 1;
    } else if (dayDiff != null && (dayDiff > 30 || dayDiff < 0)) {
      let fromDate = selectedDate;
      fromDate = (moment(selectedDate).subtract(30, 'day')).toDate();
      this.fromDate.setValue(fromDate);
      duration = moment(selectedDate).diff(this.fromDate.value, 'day');
    }
    if (duration != null || isPeriodChange) {
      duration = moment(selectedDate).diff(this.fromDate.value, 'day');
      this.loadStoreStatistics(duration);
    }
  }

  fromMonthHandler(date) {
    let monthDiff = moment(this.toDate.value).diff(date, 'month');
    if (monthDiff != null && (monthDiff >= 12 || monthDiff <= 0)) {
      let toDate = date;
      toDate = moment(toDate).add(11, 'month').toDate();
      toDate = (toDate > moment().toDate()) ? moment().toDate() : toDate;
      this.toDate.setValue(toDate);
      monthDiff = moment(toDate).diff(date, 'month');
      this.loadStoreStatistics(monthDiff);
    } else if (monthDiff != null) {
      this.loadStoreStatistics(monthDiff);
    }
  }

  toMonthHandler(date) {
    let monthDiff = moment(date).diff(this.fromDate.value, 'month');
    if (monthDiff != null && (monthDiff >= 12 || monthDiff <= 0)) {
      let fromDate = date;
      fromDate = moment(fromDate).subtract(11, 'month').toDate();
      this.fromDate.setValue(fromDate);
      monthDiff = moment(date).diff(fromDate, 'month');
      this.loadStoreStatistics(monthDiff);
    } else if (monthDiff != null) {
      this.loadStoreStatistics(monthDiff);
    }
  }
  onPeriodChange() {
    this.periodicTerm === 'DAILY'
      ? this.toDayHandler(this.toDate.value, true)
      : this.toMonthHandler(this.toDate.value);
  }
  getMonthStartDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  getMonthEndDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
}
