<!DOCTYPE html>
<html lang="en">

@include('header')

<body>

  @include('navbar')


  <main id="main">

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
          
          @foreach ($get_gallery as $data)
          
          <div class="col-lg-4 col-md-6 gallery-item filter-home">
            <div class="gallery-wrap">
              <img src='{{$data->images}}' class="img-fluid" alt="">
              <div class="gallery-info">
                {{-- <h4>Home 1</h4>
                <p>Home</p> --}}
                <div class="gallery-links">
                  <a href="{{asset("$data->images")}}" class="glightbox" title=""><i class="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          @endforeach



        </div>

      </div>
    </section><!-- End Gallery Section -->

  </main><!-- End #main -->

@include('footer')

</body>

</html>