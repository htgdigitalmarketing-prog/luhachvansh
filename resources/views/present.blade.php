<!DOCTYPE html>
<html lang="en">

@include('header')

<body>

  @include('navbar')


  <main id="main">

    <!-- ======= Breadcrumbs ======= -->
    <section id="breadcrumbs" class="breadcrumbs">
      <div class="container">

        <div class="d-flex justify-content-between align-items-center">
          <h2>Present Day Spread</h2>
          <ol>
            <li><a href="index.html">Home</a></li>
            <li>Present Day</li>
          </ol>
        </div>

      </div>
    </section><!-- End Breadcrumbs -->

    <!-- ======= Gallery Section ======= -->
    <section id="gallery" class="gallery">
      <div class="container">

        {{-- <div class="row">
          <div class="col-lg-12 d-flex justify-content-center">
            <ul id="gallery-flters">
              <li data-filter="*" class="filter-active">All</li>
              <li data-filter=".filter-home">Home</li>
              <li data-filter=".filter-beach">Beach</li>
              <li data-filter=".filter-vacation">Vacation</li>
            </ul>
          </div>
        </div> --}}

        <div class="row gallery-container">

          <div class="col-lg-4 col-md-6 gallery-item filter-home">
            <a href="" title="">
              <div class="gallery-wrap">
                <img src="{{asset('frontend/img/uttarpradesh.jpg')}}" class="img-fluid" alt="">
                <h3>Total Members :-{{$uttarpradesh_count}}</h3>
              </div>
            </a>
          </div>


          <div class="col-lg-4 col-md-6 gallery-item filter-home">
            <a href="" title="">
              <div class="gallery-wrap">
                <img src="{{asset('frontend/img/haryana.png')}}" class="img-fluid" alt="">
                <h3>Total Members :-{{$haryana_count}}</h3>
              </div>
            </a>
          </div>


          <div class="col-lg-4 col-md-6 gallery-item filter-home">
            <a href="" title="">
              <div class="gallery-wrap">
                <img src="{{asset('frontend/img/rajasthan.png')}}" class="img-fluid" alt="">
                <h3>Total Members :-{{$rajasthan_count}}</h3>
              </div>
            </a>
          </div>

        </div>

      </div>
    </section><!-- End Gallery Section -->

  </main><!-- End #main -->

@include('footer')

</body>

</html>