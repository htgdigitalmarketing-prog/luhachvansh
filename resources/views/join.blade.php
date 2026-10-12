
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
          <h2>Contact</h2>
          <ol>
            <li><a href="index.html">Home</a></li>
            <li>Contact</li>
          </ol>
        </div>

      </div>
    </section><!-- End Breadcrumbs -->

    <!-- ======= Contact Us Section ======= -->
    <section id="contact-us" class="contact-us">
    
      <div class="container">
        <h2 class="text-center">हमसे जुड़े</h2>
        <div class="row">

          <div class="col-lg-4">
           <img src="{{asset('frontend/img/undraw_fatherhood_7i19.svg')}}" alt="" class="img-fluid">

          </div>

          <div class="col-lg-8 mt-5 mt-lg-0">

            <form action="{{route('store_joinus')}}" method="POST" role="form" class="php-email-form">
             @csrf
              <div class="row">
                <div class="col-md-6 form-group ">
                  <input type="text" name="name" class="form-control" id="name" placeholder="Your Name" required>
                  <div class="validate"></div>
                </div>
                <div class="col-md-6 form-group">
                  <input type="text" name="father" class="form-control" id="name" placeholder="Father Name" required>
                  <div class="validate"></div>
                </div>
                <div class="col-md-6 form-group mt-3 ">
                  <input type="text" name="age" class="form-control " id="name" placeholder="Your age" required>
                  <div class="validate"></div>
                </div>
                <div class="col-md-6 form-group mt-3 ">
                  <select name="profession" id="Profession" class="form-control text-muted" style="font-size: 14px; padding:9px 7px">
                    <option value="" hidden class="form-control ">Your professtion</option>
                    <option value="Professor"class="form-control ">Professor</option>
                    <option value="Doctor" class="form-control ">Doctor</option>
                    <option value="Engineer"class="form-control ">Engineer</option>
                    <option value="Lawyer"class="form-control ">Lawyer</option>
                    <option value="CA"class="form-control ">CA's</option>
                    <option value="Corporates"class="form-control ">Corporates</option>
                    <option value="Military"class="form-control ">Military</option>
                    <option value="Civil Services"class="form-control ">Civil Services</option>
                    <option value="Politician"class="form-control ">Politician</option>
                </select>
                </div>

                <div class="col-md-6 form-group mt-3">
                  <input type="number" class="form-control" name="phone" id="phone" placeholder="Contact number" required>
                  <div class="validate"></div>
                </div>
                <div class="col-md-6 form-group mt-3">
                  <input type="email" class="form-control" name="email" id="email" placeholder="Your Email">
                  <div class="validate"></div>
                </div>
              </div>
              <div class="form-group mt-3">
                <input type="text" class="form-control" name="subject" id="subject" placeholder="Subject" data-rule="minlen:4" required>
                <div class="validate"></div>
              </div>
              <div class="form-group mt-3">
                <textarea class="form-control" name="message" rows="5" placeholder="Message" required></textarea>
                <div class="validate"></div>
              </div>
              <div class="my-3">
                <div class="loading">Loading</div>
                <div class="error-message"></div>
                <div class="sent-message">Your message has been sent. Thank you!</div>
              </div>
              <div class="text-center">
                <button type="submit">Join Us</button>
              </div>
            </form>

          </div>

        </div>
     
      </div>
    </section><!-- End Contact Us Section -->

  </main><!-- End #main -->

  @include('footer')

</body>

</html>