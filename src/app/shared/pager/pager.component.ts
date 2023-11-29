import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { pager } from './pager.function';
import { Paging } from '../../api/types/Pageable';

const offsetToPage = (offset: number, limit: number) => Math.floor(offset / limit) + 1;

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagerComponent implements OnChanges {
  @Input() totalPagesCount: number;
  @Input() page: number;
  @Input() size: number;

  @Output() paginate = new EventEmitter<Paging>();

  pagesList: number[] = [];
  selectedPage = 1;
  visiblePages: number;
  // totalPagesCount: number;

  private pager = pager(5);

  ngOnChanges(changes: SimpleChanges) {
    this.selectedPage = this.page + 1;
    const paginationResults = this.pager(this.totalPagesCount || 0, this.selectedPage);
    this.pagesList = paginationResults.pagesList;
    // this.totalPagesCount = paginationResults.totalPagesCount;
    this.visiblePages = paginationResults.visiblePages;
  }

  get showFirstPage(): boolean {
    return this.pagesList[0] > 1;
  }

  get showFirstPageDots(): boolean {
    return this.pagesList[0] - 1 > 1;
  }

  get showLastPage(): boolean {
    return this.pagesList[this.pagesList.length - 1] < this.totalPagesCount;
  }

  get showLastPageDots(): boolean {
    return this.totalPagesCount - this.pagesList[this.pagesList.length - 1] > 1;
  }

  goTo(page: any) {
    if (typeof page === 'number') {
      this.paginate.emit({
        page: (page - 1),
        size: this.size
      });
    }
  }
}
