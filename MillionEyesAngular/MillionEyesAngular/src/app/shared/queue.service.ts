import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Metric } from './metric.model';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import 'rxjs/add/operator/map';
import { Point } from './point.model';
import { environment } from '../../environments/environment';

@Injectable()
export class QueueService {
    constructor(private http: Http) { }

    get(): Observable<Array<Metric>> {
        return this.http.get(environment.queueUrl + 'getallmetrics').map(response => {
            return this.formQueuesMetrics(response);
        });
    }

    getForLastHours(hoursCount: number, interval: number): Observable<Array<Metric>> {
        return this.http.get(environment.queueUrl + 'getmetricsforhours?hour=' + hoursCount + '&interval=' + interval).map(response => {
                return this.formQueuesMetrics(response);
            });
    }

    getForTimeInterval(date1: Date, date2: Date, interval: number) {

        // tslint:disable-next-line:prefer-const
        let date1String = moment(date1.toString()).format('YYYY-MM-DDTHH:MM:SS') + 'Z';
        // tslint:disable-next-line:prefer-const
        let date2String = moment(date2.toString()).format('YYYY-MM-DDTHH:MM:SS') + 'Z';

        // tslint:disable-next-line:max-line-length
        return this.http.get(environment.queueUrl + 'getmetricsforperiod?startTime=' + date1String + '&endTime=' + date2String + '&interval=' + interval).map(response => {
                return this.formQueuesMetrics(response);
            });
    }

    changeMetric(interval: number, metricName: string) {
        // tslint:disable-next-line:max-line-length
        return this.http.get(environment.queueUrl + 'getmetricsbyname?interval=' + interval + '&metricName=' + metricName).map(response => {
                return this.formQueuesMetrics(response);
            });
    }

    formQueuesMetrics(response) {
        // tslint:disable-next-line:prefer-const
        let queuesMetrics: Array<Metric> = new Array<Metric>();

        // tslint:disable-next-line:prefer-const
        let queuesData = response.json();

        for (let i = 0; i < queuesData.QueueMetrics.length; i++) {
            // tslint:disable-next-line:prefer-const
            let metric: Metric = {metricName: '', points: new Array<Point>()};

            metric.metricName = queuesData.QueueMetrics[i].QueueName;

            for (let j = 0; j < queuesData.QueueMetrics[i].QueueMetrics.length; j++) {
                // tslint:disable-next-line:max-line-length
                metric.points.push({date: new Date(queuesData.QueueMetrics[i].QueueMetrics[j].Time), count: queuesData.QueueMetrics[i].QueueMetrics[j].Count});
            }

            console.log(metric);

            queuesMetrics.push(metric);
        }

        return queuesMetrics;
    }
}
