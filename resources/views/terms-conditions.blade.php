<?php

    $get_about=DB::table('about')->where('id',1)->first();

?>

@include('header')

<body>
    <div class="evolution">
        
        @include('navbar')

<section class="container py-5">
    <div class="row">
        <div class="col-lg-10 mx-auto">

            <h1 class="text-center mb-4">Terms & Conditions</h1>

            <p><strong>Last Updated:</strong> June 16, 2026</p>

            <p>
                Welcome to <strong>Luhach Vansh</strong> (luhachvansh.com).
                By accessing and using this website, you agree to comply with and be
                bound by the following Terms and Conditions. If you do not agree with
                any part of these terms, please discontinue use of the website.
            </p>

            <hr>

            <h3>Website Purpose</h3>

            <p>
                Luhach Vansh is an informational and community-based website created
                to share information related to the history, genealogy, achievements,
                news, photographs, and activities of the Luhach community.
            </p>

            <hr>

            <h3>Use of Website</h3>

            <p>
                You may access and use this website for lawful and informational
                purposes only.
            </p>

            <p>
                You agree not to:
            </p>

            <ul>
                <li>Use the website for any unlawful activity.</li>
                <li>Attempt to gain unauthorized access to website systems or data.</li>
                <li>Upload malicious software, viruses, or harmful content.</li>
                <li>Disrupt or interfere with the normal operation of the website.</li>
                <li>Use the website in a manner that may damage its reputation.</li>
            </ul>

            <hr>

            <h3>Content Accuracy</h3>

            <p>
                We strive to keep the information on this website accurate and
                up-to-date. However, we make no guarantees regarding the completeness,
                reliability, or accuracy of any content.
            </p>

            <p>
                Any action you take based on information available on this website is
                strictly at your own risk.
            </p>

            <hr>

            <h3>Intellectual Property Rights</h3>

            <p>
                Unless otherwise stated, all content available on this website,
                including text, images, graphics, logos, design elements, articles,
                and photographs, is the property of Luhach Vansh or its respective
                owners and is protected under applicable copyright laws.
            </p>

            <p>
                You may not reproduce, distribute, modify, republish, or exploit any
                content from this website without prior written permission.
            </p>

            <hr>

            <h3>User Submitted Information</h3>

            <p>
                If you voluntarily submit information through any contact form or
                submission form available on this website, you confirm that the
                information provided is accurate and does not violate the rights of
                any third party.
            </p>

            <p>
                We reserve the right to review, edit, or remove any submitted content
                if deemed inappropriate, inaccurate, unlawful, or offensive.
            </p>

            <hr>

            <h3>Third-Party Links</h3>

            <p>
                This website may contain links to external websites for informational
                purposes.
            </p>

            <p>
                We have no control over the content, policies, or practices of
                third-party websites and assume no responsibility for them.
            </p>

            <hr>

            <h3>Advertisements</h3>

            <p>
                This website may display advertisements provided by Google AdSense
                and other advertising partners.
            </p>

            <p>
                We are not responsible for the products, services, or content
                advertised by third parties.
            </p>

            <hr>

            <h3>Limitation of Liability</h3>

            <p>
                To the maximum extent permitted by law, Luhach Vansh shall not be
                liable for any direct, indirect, incidental, consequential, or
                special damages resulting from the use of, or inability to use,
                this website.
            </p>

            <hr>

            <h3>Changes to Terms</h3>

            <p>
                We reserve the right to modify these Terms & Conditions at any time
                without prior notice.
            </p>

            <p>
                Continued use of the website following any updates constitutes
                acceptance of the revised terms.
            </p>

            <hr>

            <h3>Governing Law</h3>

            <p>
                These Terms & Conditions shall be governed and interpreted in
                accordance with the laws of India.
            </p>

            <hr>

            <h3>Contact Us</h3>

            <p>
                If you have any questions regarding these Terms & Conditions,
                please contact us through the Contact Us page available on
                this website.
            </p>

            <p>
                <strong>Website:</strong>
                https://luhachvansh.com
            </p>

        </div>
    </div>
</section>

@include('footer')

</body>

</html>

