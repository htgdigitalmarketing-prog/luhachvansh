<?php

    $get_about=DB::table('about')->where('id',1)->first();

?>

@include('header')

<body>
    <div class="evolution">
        
        @include('navbar')


        <main id="main">
            <!-- ======= My & Family Section ======= -->
            <section id="about" class="about">
                <div class="container">
                  <div class="section-title">
                    <h2>History</h2>
                    <p class="text-size" style="font-family: 'Martel Sans', sans-serif; text-align: justify;">
                        {!!$get_history->history!!}
                   </p>
                   <!-- <div class="row hisImg">
                       <div class="col-6">
                           <img src="http://amazonhub.online/frontend/img/about/image_one.jpeg" alt="" class="img-fluid">
                       </div>
                       <div class="col-6">
                           <img src="http://amazonhub.online/frontend/img/about/image_one.jpeg" alt="" class="img-fluid">
                       </div>
                   </div> -->
                  </div>
          
                </div>
            </section>
            <!-- End My & Family Section -->

        </main>
    </div>

@include('footer')

</body>

</html>