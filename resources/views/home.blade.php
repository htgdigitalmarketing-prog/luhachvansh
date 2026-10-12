<?php

    $get_about=DB::table('about')->where('id',1)->first();

?>
<!DOCTYPE html>
<html lang="en">

@include('header')

<body>

  @include('navbar')

  <div>
    <div class="row" style="margin-left: 0px;margin-right: 0px;">
      <div class="col-lg-3 col-xl-3 col-xxl-3 col-md-6  order-lg-1 order-md-1 order-1">
        <div class="card sideImg">
          <div class="card-body">
            <img src="{{asset('frontend/img/2.jpg')}}" alt="" class="img-fluid h-100">
          </div>
        </div>
      </div>
      <div class="col-lg-6 col-xl-6 col-xxl-6 order-lg-2 order-md-3 order-2">
        <!-- ======= Hero Section ======= -->
        <section id="hero" class="myHero">
          <div id="heroCarousel" data-bs-interval="5000" class="carousel slide carousel-fade" data-bs-ride="carousel">

            <ol class="carousel-indicators" id="hero-carousel-indicators"></ol>

            <div class="carousel-inner" role="listbox">

              @foreach ($get_slider as $data)

              @if ($loop->first)
              <div class="carousel-item active" style="background-image: url({{$data->images}})">
              </div>

              @else
              <div class="carousel-item " style="background-image: url({{$data->images}})">
              </div>
              @endif

              @endforeach

            </div>

            <a class="carousel-control-prev" href="#heroCarousel" role="button" data-bs-slide="prev">
              <span class="carousel-control-prev-icon bi bi-chevron-left" aria-hidden="true"></span>
            </a>

            <a class="carousel-control-next" href="#heroCarousel" role="button" data-bs-slide="next">
              <span class="carousel-control-next-icon bi bi-chevron-right" aria-hidden="true"></span>
            </a>

          </div>
        </section><!-- End Hero -->
      </div>
      <div class="col-lg-3 col-xl-3 col-xxl-3 col-md-6  order-lg-3 order-md-2 order-3 ">
        <div class="card sideImg">
          <div class="card-body">
            <img src="{{asset('frontend/img/newImg.jpeg')}}" alt="" class="img-fluid" width="150">
          </div>
        <p>चौ उमराव सिंह लुहाच भारतीय अंग्रेजी सेना द्वारा रायसाहब की उपाधि से सम्मानित, शीशपाल जी द्वारा लिखित गांव भड़ंगपुर की वंशावली पुस्तक में इसका वर्णन है।F.I)</p>
        </div>
      </div>
    </div>
  </div>


  {{--  new section --}}
  <div class="row m-0 p-0 mt-lg-1 mt-md-2 mt-2">
    <div class="col-lg-10 col-md-10 col-12 order-lg-1 order-md-1 order-2">
      <div class="scroll-left">
        <div class="pot">
          @foreach ($get_news as $data)

          <a style="color: white;text-decoration:none" href='{{url("/news_details/".$data->id)}}'><p>{{$data->news_title}}<span style="margin-left: 6px;"><span>new</span></span></p></a>
              
          @endforeach
        </div>
      </div>
    </div>
    <div class="col-lg-2 col-md-2 col-12 order-lg-2 order-md-2 order-1">
      <a href="#" class="btn-block h-100  text-light d-flex align-items-center justify-content-center py-lg-0 py-md-0 py-3" style="background: #2b3c6f;"><b>
          <p class="mb-0">ताजा खबर</p>
        </b></a>
    </div>
  </div>

  <main id="main">

    {{-- <section>
      <div class="section-title" style="padding-bottom: 0px;font-size: 48px;">
        <h2>See our community</h2>
      </div>
      <div class="mapContainer">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6999.649048307317!2d77.11247862169688!3d28.694895290817342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03e59a4b777f%3A0xce853f23cb71d061!2sDeepali%2C%20Pitam%20Pura%2C%20Delhi%2C%20110034!5e0!3m2!1sen!2sin!4v1626419779028!5m2!1sen!2sin"
          width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
      </div>

    </section> --}}



    <!-- ======= My & Family Section ======= -->
    <section id="about" class="about">
      <div class="container">
        <div class="section-title">
          <h2>हमारे बारे में</h2>
          <p class="textSize" style="text-align: justify;">
            {!!$get_about->para!!}
          </p>
        </div>

        <div class="row content">
          <div class="col-lg-12">
            <img src='{{asset("$get_about->image_one_path")}}' width="100%" class="img-fluid" alt="">
          </div>
          <div class="col-lg-12">
            <img src='{{asset("$get_about->image_two_path")}}' width="100%" class="img-fluid" alt="">
          </div>
          <div class="col-lg-6 pt-4 pt-lg-0">

            {{-- <p>
               रिटार्ड कर्नल कर्मबीर सिंह लुहाच जो की भारतीय सेना मे लगभग 40 वर्ष अपनी सेवा देने के उपरान्त 30 अप्रैल 2019 को सेवानिवृत होने के बाद जनवरी 2021 से अपने वंश का इतिहास और वंश के फैलाव का पता लगाने की एक मुहिम की शुरआत की और उनके इस अथक प्रयास से 1 महीने मे लुहाच गोत्र के 37 गाँवो का पता लगा लिया गया था  जिसके फलस्वरूप आज उत्तरी भारत मे हरियाणा , राजस्थान व् उत्तेर प्रदेश के 42 गाँवो मे लुहाच गोत्र के लोग रहते है। 
            </p> --}}

            {{-- <p>
              कर्नल कर्मबीर सिंह लुहाच
              गाँव- गुगाहेड़ी 
              जिला - रोहतक (हरियाणा )
              
              चरन सिंह लुहाच
              गाँव- नगला उग्रसैन,                 
              जिला - बुलन्दहर (उत्तर प्रदेश)
            </p> --}}
            {{-- <a href="our-story.html" class="btn-learn-more">Learn More</a> --}}
          </div>
        </div>

      </div>
    </section>
    <!-- End My & Family Section -->

    <section>
      <div class="section-title" style="padding-bottom: 0px;">
        <h2>एचीवर्स</h2>
      </div>
      <div class="professionContainer">
        <div class="row" style="margin-right: 0; margin-left: 0;">
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Professor')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/professor.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Professor</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Doctor')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/doctor.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Doctor</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Engineer')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/engineer.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Engineer</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Lawyer')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/lawyer.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Lawyer</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/CA')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/accountant.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>CA's</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Corporates')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/businessman.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Corporates</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Military')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/soldier.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Military</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Goverment Servant')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/policeman.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Goverment Servant</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Politician')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/stump.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Politician</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Sports')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/sports.jpg')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Sports</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Police')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/police.png')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Police</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-2 col-md-3 col-6">
            <a href="{{url('achievers/Other')}}">
              <div class="card">
                <div class="card-body">
                  <img src="{{asset('frontend/img/professions/other.jpg')}}" alt="" class="img-fluid">
                </div>
                <div class="card-footer">
                  <p>Other</p>
                </div>
              </div>
            </a>
          </div>
          
        </div>
      </div>
    </section>


    <!-- ======= Recent Photos Section ======= -->
    <section id="recent-photos" class="recent-photos">
      <div class="container">

        <div class="section-title">
          <h2>नवीन छवि</h2>
          {{-- <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit sint
            consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat sit
            in iste officiis commodi quidem hic quas.</p> --}}
        </div>

        <div class="recent-photos-slider swiper-container">
          <div class="swiper-wrapper align-items-center">
            @foreach ($get_gallery as $key=>$data)
            <div class="swiper-slide">
              <a href="{{asset('$data->images')}}" class="glightbox">
                  <img src="{{$data->images}}" height="200px" width="auto" alt="image">
              </a>
            </div>

            @endforeach
          </div>
          <div class="swiper-pagination"></div>
        </div>

      </div>
    </section><!-- End Recent Photos Section -->


    <section class="downloadDirectory">
      <div class="section-title" style="padding-bottom: 0px;font-size: 48px;">
        <h2 style="margin-top: -40px;">लुहाच वंशावली </h2>
        <button class="">वंशावली डाउनलोड करें <span><i class='bx bx-arrow-to-bottom'></i></span></button>
      </div>
    </section>

    <br><br>

  </main><!-- End #main -->

  @include('footer')

</body>

</html>