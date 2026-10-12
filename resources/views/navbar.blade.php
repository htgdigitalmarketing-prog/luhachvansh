<?php

$state = DB::table('members')->select('state')->groupby('state')->get();

?>



<!-- ======= Header ======= -->
<header id="header" class="fixed-top">
  <div class="container d-flex align-items-center justify-content-between flex-md-row flex-lg-row flex-column ">
    <div class="logoContainer d-flex align-items-center">
      <!--<a href="index.html" class="logo"><img src="http://upcane.gov.in/images/cm.png" alt="" class="img-fluid"></a>-->
      <a href="{{route('home')}}" class="logo"><img src='{{asset("frontend/img/logo.jpeg")}}' alt="" class="img-fluid"></a>
      <h1 class="logo " style="font-size: 4rem"><a href="{{route('home')}}">लुहाच परिवार
        </a></h1>
    </div>
    <div class="contactConatiner d-md-flex d-lg-flex align-items-center flex-column d-none">
      <div class="num d-flex align-items-centerflex-md-row flex-lg-row flex-column mt-lg-0 mt-md-0 mt-2">
        <h4>हेल्पलाइन नंबर:</h4>
        <div class="d-flex align-items-center">
          <h5 class="numo">+91 9354890524</h5>,<h5 class="numo">+91 7053839972</h5>
        </div>
      </div>
      <div class="social-links">
        <!--<a href="#" class="twitter"><i class="bx bxl-twitter"></i></a>-->
        <a href="https://www.facebook.com/profile.php?id=61583757066090" class="facebook"><i class="bx bxl-facebook"></i></a>
        <a href="#" class="instagram"><i class="bx bxl-instagram"></i></a>
        <a href="https://www.youtube.com/@luhach7256" class="youtube"><i class="bx bxl-youtube"></i></a>
        <!--<a href="#" class="linkedin"><i class="bx bxl-linkedin"></i></a>-->
        <!--<a href="https://www.youtube.com/user/vipinluhach" class="linkedin"><i class="bx bxl-youtube"></i></a>-->
      </div>
    </div>

    <!-- .navbar -->

  </div>
  <nav id="navbar" class="navbar">
    <ul class="w-100">
      <li><a href="{{route('home')}}">मुख्य पृष्ठ</a></li>
      <li class="dropdown"><a href="{{route('about')}}"><span>हमारे बारे में</span> <i class="bi bi-chevron-down"></i></a>
        <ul>
          <li class="dropdown"><a href='{{route('about')}}'><span>हमारे बारे में</span></a></li>
          <li class="dropdown"><a href='{{route('team')}}'><span> टीम</span></a></li>
          <li class="dropdown"><a href='{{route('kuldevi')}}'><span>कुलदेवी</span></a></li>
        </ul>
      </li>
      {{-- <li><a href="{{route('evolution')}}">वंशावली</a></li> --}}
      <li><a target="_blank" href="{{asset('frontend/img/vanshavali.png')}}">वंशावली</a></li>
      <li><a href="{{route('history')}}">इतिहास</a></li>
      <li class="dropdown"><a href="{{route('present')}}"><span>हमारे गांव</span> <i class="bi bi-chevron-down"></i></a>
        <ul>

          @foreach ($state as $key=>$data)

          {{-- <li class="dropdown"><a href='{{url("search/state/$data->state")}}'><span>{{$data->state}}</span> <i class="bi bi-chevron-right"></i></a> --}}
          <li class="dropdown"><a href=''><span>{{$data->state}}</span> <i class="bi bi-chevron-right"></i></a>
            <ul>
              <?php
              $district = DB::table('members')->groupby('current_district')->select('current_district')->where('state', $data->state)->get();
              ?>
              @foreach ($district as $dat)

              {{-- <li class="dropdown text-center"><a href='{{url("search/district/$dat->current_district")}}'>{{$dat->current_district}}<i class="bi bi-chevron-right"></i> </a> --}}
              <li class="dropdown text-center"><a href=''>{{$dat->current_district}}<i class="bi bi-chevron-right"></i> </a>
                <ul class="mt-4">
                  <?php
                  $city = DB::table('members')->groupby('current_city')->select('current_city')->where('state', $data->state)->where('current_district', $dat->current_district)->get();
                  ?>
                  @foreach ($city as $da)
                  <li><a href='{{url("search/city/$da->current_city")}}'><span>{{$da->current_city}}</span></a></li>
                  @endforeach
                </ul>
              </li>

              @endforeach

            </ul>
          </li>

          @endforeach

        </ul>
      </li>
      <li><a href="{{route('memories')}}">गैलरी</a></li>

      <li><a href="{{url('shaheed')}}">शहीद </a></li>
      <li><a href="{{url('achievers/all')}}">एचीवर्स</a></li>
      <li><a href="{{route('join')}}">हमसे जुड़ें</a></li>
    </ul>
   <div class="w-100 d-flex align-items-center justify-content-between px-3 mt-2 bg-primary text-light">
     <i></i>
   <i class="bi bi-list mobile-nav-toggle my-2 text-light">Menu</i>
   </div>
  </nav>
</header><!-- End Header -->