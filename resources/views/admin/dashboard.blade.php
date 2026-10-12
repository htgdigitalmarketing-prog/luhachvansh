@extends('admin.layout')

@section('content')
<div class="c-body">
  <main class="c-main">
    <div class="container-fluid">
      <div class="fade-in">
        <div class="row">
          <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-gradient-primary">
              <div class="card-body card-body pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div>Total Members</div>
                </div>
                <div class="btn-group">
                  <div class="text-value-lg">{{$members_count}}</div>
                </div>
              </div>
              <div class="c-chart-wrapper mt-3 mx-3" style="height:70px;">
                <canvas class="chart" id="card-chart1" height="70"></canvas>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-gradient-info">
              <div class="card-body card-body pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div>Total Requests </div>
                </div>
                <div class="btn-group">
                  <div class="text-value-lg">{{$join_us_count}}</div>
                </div>
              </div>
              <div class="c-chart-wrapper mt-3 mx-3" style="height:70px;">
                <canvas class="chart" id="card-chart2" height="70"></canvas>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-gradient-warning">
              <div class="card-body card-body pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div>Gallery Images</div>
                </div>
                <div class="btn-group">
                  <div class="text-value-lg">{{$gallery_count}}</div>
                </div>
              </div>
              <div class="c-chart-wrapper mt-3" style="height:70px;">
                <canvas class="chart" id="card-chart3" height="70"></canvas>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-gradient-danger">
              <div class="card-body card-body pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div>Total News</div>
                </div>
                <div class="btn-group">
                  <div class="text-value-lg">{{$news_count}}</div>
                </div>
              </div>
              <div class="c-chart-wrapper mt-3 mx-3" style="height:70px;">
                <canvas class="chart" id="card-chart4" height="70"></canvas>
              </div>
            </div>
          </div>


        </div>


      </div>
    </div>
  </main>
</div>


@endsection
